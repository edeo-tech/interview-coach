#!/usr/bin/env python3
"""
Test script for the OpenAI web search fallback implementation
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.services.job_processing_service import JobProcessingService

async def test_intelligent_fallback():
    """Test the intelligent fallback functionality"""
    
    # Test URL that typically blocks scrapers
    test_url = "https://www.jobs-graduate.co.uk/job/223920988/Graduate-Junior-Developer"
    
    print("Testing OpenAI Intelligent Fallback")
    print("=" * 50)
    
    service = JobProcessingService()
    
    try:
        print(f"Testing URL: {test_url}")
        print("This URL should trigger the intelligent fallback...")
        print()
        
        # Process the job URL (should use intelligent fallback)
        result = await service.process_job_url(test_url)
        
        print("SUCCESS: Job processing completed!")
        print(f"Extraction Method: {result.get('extraction_method', 'unknown')}")
        print(f"Extraction Confidence: {result.get('extraction_confidence', 0.0)}")
        print(f"Company: {result.get('company', 'N/A')}")
        print(f"Role Title: {result.get('role_title', 'N/A')}")
        print(f"Location: {result.get('location', 'N/A')}")
        print()
        
        # Verify metadata
        metadata = result.get('metadata', {})
        print("Metadata:")
        print(f"  - Source: {metadata.get('source', 'N/A')}")
        print(f"  - Confidence Score: {metadata.get('confidence_score', 'N/A')}")
        print(f"  - Extraction Notes: {metadata.get('extraction_notes', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False
    
    finally:
        await service.close()

async def test_direct_scraping():
    """Test direct scraping with a URL that should work"""
    
    # Test URL that should work with direct scraping
    test_url = "https://jobs.lever.co/example"  # This might work better
    
    print("\nTesting Direct Scraping")
    print("=" * 50)
    
    service = JobProcessingService()
    
    try:
        print(f"Testing URL: {test_url}")
        print("This should attempt direct scraping first...")
        print()
        
        result = await service.process_job_url(test_url)
        
        print("SUCCESS: Job processing completed!")
        print(f"Extraction Method: {result.get('extraction_method', 'unknown')}")
        print(f"Extraction Confidence: {result.get('extraction_confidence', 0.0)}")
        
        return True
        
    except Exception as e:
        print(f"Expected error (URL might not exist): {str(e)}")
        return False
    
    finally:
        await service.close()

if __name__ == "__main__":
    print("OpenAI Intelligent Fallback Test Suite")
    print("=" * 60)
    
    # Test 1: Intelligent fallback
    asyncio.run(test_intelligent_fallback())
    
    # Test 2: Direct scraping (if URL exists)
    # asyncio.run(test_direct_scraping())
    
    print("\nTest completed!")