from typing import Optional, Tuple
from datetime import datetime, timezone
from fastapi import Request

from models.companies import CompanyInfo
from services.brandfetch_service import BrandfetchService
from crud._generic._db_actions import createDocument, getMultipleDocuments, updateDocument


async def get_or_create_company_info(
    req: Request,
    company_name: str,
    company_website: Optional[str] = None
) -> Optional[Tuple[str, str]]:
    """
    Get or create company info with Brandfetch identifiers.
    
    Args:
        req: FastAPI request object
        company_name: Company name from job posting
        company_website: Optional company website URL
        
    Returns:
        Tuple of (identifier_type, identifier_value) or None if not found
    """
    if not company_name or not company_name.strip():
        print("Empty company name provided, returning None")
        return None
    
    if company_website:
        print(f"Starting company info lookup for: {company_name} (with company website: {company_website})")
    else:
        print(f"Starting company info lookup for: {company_name} (no company website provided - will search by name only)")
    
    brandfetch_service = BrandfetchService()
    
    try:
        # Normalize company name
        normalized_name = brandfetch_service.normalize_company_name(company_name)
        print(f"Normalized company name: '{company_name}' -> '{normalized_name}'")
        
        # Extract domain from website if provided
        domain = None
        if company_website:
            domain = brandfetch_service.extract_domain_from_url(company_website)
            if domain:
                print(f"Extracted domain from website: {company_website} -> {domain}")
            else:
                print(f"Could not extract valid domain from: {company_website}")
        
        # Check if we already have this company in our database
        # First, try to find by domain if we have one
        if domain:
            print(f"Checking for existing company info by domain: {domain}")
            existing_companies = await getMultipleDocuments(
                req, "company_info", CompanyInfo,
                domain=domain,
                limit=1
            )
            if existing_companies:
                company_info = existing_companies[0]
                print(f"Found existing company info by domain {domain}: {company_info.brandfetch_identifier_value}")
                return (company_info.brandfetch_identifier_type, company_info.brandfetch_identifier_value)
            else:
                print(f"No existing company info found by domain: {domain}")
        
        # Then try to find by normalized name
        print(f"Checking for existing company info by normalized name: {normalized_name}")
        existing_companies = await getMultipleDocuments(
            req, "company_info", CompanyInfo,
            normalized_name=normalized_name,
            limit=1
        )
        if existing_companies:
            company_info = existing_companies[0]
            print(f"Found existing company info by name {normalized_name}: {company_info.brandfetch_identifier_value}")
            
            # Update domain if we have one and it's missing
            if domain and not company_info.domain:
                print(f"Updating existing company info with missing domain: {domain}")
                await updateDocument(
                    req, "company_info", CompanyInfo, 
                    str(company_info.id),
                    domain=domain,
                    updated_at=datetime.now(timezone.utc)
                )
                print(f"Successfully updated company info with domain")
                
            return (company_info.brandfetch_identifier_type, company_info.brandfetch_identifier_value)
        else:
            print(f"No existing company info found by normalized name: {normalized_name}")
        
        # Company not found in cache, need to look it up
        print(f"Company '{company_name}' not found in cache, will search Brandfetch using company name")
        
        # If we have a domain, we can use it directly as the identifier
        if domain:
            print(f"Using domain as direct identifier: {domain}")
            # Create company info with domain as identifier
            confidence = 0.9  # High confidence when we have a domain
            
            print(f"Creating new company info record with domain identifier")
            company_info = CompanyInfo(
                normalized_name=normalized_name,
                domain=domain,
                brandfetch_identifier_type="domain",
                brandfetch_identifier_value=domain,
                match_confidence=confidence,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            
            try:
                await createDocument(req, "company_info", CompanyInfo, company_info)
                print(f"Created company info with domain identifier: {domain}")
                return ("domain", domain)
            except Exception as e:
                print(f"Failed to create company info with domain {domain}: {str(e)}")
                raise
        
        # No domain, need to search Brandfetch
        print(f"No domain available, searching Brandfetch API by company name: {company_name}")
        search_result = await brandfetch_service.search_company(company_name)
        
        if not search_result:
            print(f"No Brandfetch results found for company: {company_name}")
            return None
        
        print(f"Brandfetch search returned result: {search_result.get('name', 'N/A')} (domain: {search_result.get('domain', 'N/A')})")
        
        # Extract identifier from search result
        try:
            identifier_type, identifier_value = brandfetch_service.extract_identifier_from_result(search_result)
            print(f"Extracted identifier: {identifier_type}={identifier_value}")
        except Exception as e:
            print(f"Failed to extract identifier from Brandfetch result: {str(e)}")
            return None
        
        # Calculate match confidence
        result_name = search_result.get('name', '')
        has_domain = identifier_type == "domain"
        confidence = brandfetch_service.calculate_match_confidence(
            company_name, result_name, has_domain
        )
        print(f"Calculated match confidence: {confidence} (query: '{company_name}' vs result: '{result_name}')")
        
        # Create company info record
        print(f"Creating new company info record from Brandfetch search result")
        company_info = CompanyInfo(
            normalized_name=normalized_name,
            domain=identifier_value if identifier_type == "domain" else None,
            brandfetch_identifier_type=identifier_type,
            brandfetch_identifier_value=identifier_value,
            match_confidence=confidence,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        try:
            await createDocument(req, "company_info", CompanyInfo, company_info)
            print(f"Created company info for '{company_name}': {identifier_type}={identifier_value} (confidence: {confidence})")
            return (identifier_type, identifier_value)
        except Exception as e:
            print(f"Failed to create company info record: {str(e)}")
            raise
        
    except Exception as e:
        print(f"Error in get_or_create_company_info for '{company_name}': {str(e)}")
        return None
    finally:
        print("Closing Brandfetch service")
        await brandfetch_service.close()