import httpx
import re
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlparse
from decouple import config
import logging

logger = logging.getLogger(__name__)

BRANDFETCH_CLIENT_ID = config('BRANDFETCH_API_KEY', cast=str)  # Using BRANDFETCH_API_KEY env var that contains client ID


class BrandfetchService:
    def __init__(self):
        if not BRANDFETCH_CLIENT_ID:
            raise ValueError("BRANDFETCH_API_KEY environment variable is required (should contain client ID)")
        
        self.client_id = BRANDFETCH_CLIENT_ID
        self.client = httpx.AsyncClient(
            base_url="https://api.brandfetch.io/v2",
            timeout=30.0
        )
    
    async def search_company(self, company_name: str) -> Optional[Dict[str, Any]]:
        """
        Search for a company using Brandfetch Search API
        Returns the best matching result with identifier information
        """
        try:
            # Use the search endpoint with client ID parameter as per Brandfetch API docs
            response = await self.client.get(
                f"/search/{company_name}",
                params={"c": self.client_id}
            )
            
            if response.status_code != 200:
                print(f"Brandfetch search failed: {response.status_code} - {response.text}")
                return None
            
            results = response.json()
            
            if not results or len(results) == 0:
                print(f"No Brandfetch results found for company: {company_name}")
                return None
            
            # Return the first (best) match
            best_match = results[0]
            print(f"Found Brandfetch match for {company_name}: {best_match.get('name')} (domain: {best_match.get('domain', 'N/A')})")
            
            return best_match
            
        except Exception as e:
            print(f"Error searching Brandfetch for {company_name}: {str(e)}")
            return None
    
    def extract_identifier_from_result(self, search_result: Dict[str, Any]) -> Tuple[str, str]:
        """
        Extract the best identifier from a Brandfetch search result
        Returns (identifier_type, identifier_value)
        Prefers domain over brandId
        """
        # Check for domain first (preferred)
        domain = search_result.get('domain')
        if domain:
            return ("domain", domain)
        
        # Fallback to brandId
        brand_id = search_result.get('brandId')
        if brand_id:
            return ("brandId", brand_id)
        
        # This shouldn't happen with valid search results
        raise ValueError("No valid identifier found in Brandfetch search result")
    
    def normalize_company_name(self, company_name: str) -> str:
        """
        Normalize company name for consistent matching
        Removes common suffixes, converts to lowercase, removes special characters
        """
        if not company_name:
            return ""
        
        # Convert to lowercase
        normalized = company_name.lower().strip()
        
        # Remove common company suffixes
        suffixes = [
            r'\s+inc\.?$',
            r'\s+incorporated$',
            r'\s+corp\.?$',
            r'\s+corporation$',
            r'\s+ltd\.?$',
            r'\s+limited$',
            r'\s+llc\.?$',
            r'\s+l\.l\.c\.?$',
            r'\s+plc\.?$',
            r'\s+co\.?$',
            r'\s+company$',
            r'\s+gmbh$',
            r'\s+ag$',
            r'\s+sa$',
            r'\s+s\.a\.$',
            r'\s+ab$',
            r'\s+n\.v\.$',
            r'\s+b\.v\.$',
            r'\s+pty$',
            r'\s+pte$',
            r'\s+pvt$',
            r'\s+private$',
            r'\s+public$',
            r'\s+group$',
            r'\s+holding[s]?$',
            r'\s+international$',
            r'\s+global$',
            r'\s+technologies$',
            r'\s+technology$',
            r'\s+tech$',
            r'\s+systems$',
            r'\s+software$',
            r'\s+services$',
            r'\s+solutions$',
            r'\s+partners$',
            r'\s+consulting$',
            r'\s+consultants$',
        ]
        
        # Apply all suffix removals
        for suffix in suffixes:
            normalized = re.sub(suffix, '', normalized, flags=re.IGNORECASE)
        
        # Remove special characters but keep spaces
        normalized = re.sub(r'[^\w\s-]', '', normalized)
        
        # Replace multiple spaces with single space
        normalized = ' '.join(normalized.split())
        
        return normalized
    
    def extract_domain_from_url(self, url: str) -> Optional[str]:
        """
        Extract clean domain from a URL
        Returns None if URL is invalid
        """
        if not url:
            return None
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
        
        try:
            parsed = urlparse(url)
            domain = parsed.netloc
            
            # Remove www. prefix
            if domain.startswith('www.'):
                domain = domain[4:]
            
            # Validate domain format
            if domain and '.' in domain:
                return domain.lower()
            
            return None
            
        except Exception as e:
            print(f"Failed to extract domain from {url}: {str(e)}")
            return None
    
    def calculate_match_confidence(
        self, 
        search_query: str, 
        result_name: str, 
        has_domain: bool
    ) -> float:
        """
        Calculate confidence score for a match
        Returns value between 0.0 and 1.0
        """
        # Normalize both for comparison
        query_normalized = self.normalize_company_name(search_query)
        result_normalized = self.normalize_company_name(result_name)
        
        # Exact match
        if query_normalized == result_normalized:
            return 1.0
        
        # Calculate similarity
        # Simple approach: check if one contains the other
        if query_normalized in result_normalized or result_normalized in query_normalized:
            base_score = 0.8
        else:
            # Calculate word overlap
            query_words = set(query_normalized.split())
            result_words = set(result_normalized.split())
            
            if not query_words or not result_words:
                base_score = 0.3
            else:
                overlap = len(query_words & result_words)
                total = len(query_words | result_words)
                base_score = overlap / total if total > 0 else 0.3
        
        # Boost confidence if we have a domain
        if has_domain:
            base_score = min(1.0, base_score + 0.1)
        
        return round(base_score, 2)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()