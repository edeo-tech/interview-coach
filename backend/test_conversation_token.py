import asyncio
import httpx
from decouple import config

# Test the conversation token endpoint
async def test_conversation_token():
    base_url = "http://localhost:8000"  # Adjust if needed
    
    # You'll need a valid access token from a logged-in user
    # For testing, you can get this from your browser's dev tools
    access_token = "YOUR_ACCESS_TOKEN_HERE"  # Replace with actual token
    
    # Test data
    interview_id = "YOUR_INTERVIEW_ID_HERE"  # Replace with actual interview ID
    interview_types = [
        "phone_screen",
        "initial_hr_interview", 
        "mock_sales_call",
        "presentation_pitch",
        "technical_screening_call",
        "system_design_interview",
        "portfolio_review",
        "case_study",
        "behavioral_interview",
        "values_interview",
        "team_fit_interview",
        "interview_with_business_partner_client_stakeholder",
        "executive_leadership_round"
    ]
    
    async with httpx.AsyncClient() as client:
        for interview_type in interview_types:
            try:
                print(f"\n🔍 Testing interview type: {interview_type}")
                
                response = await client.post(
                    f"{base_url}/app/interviews/{interview_id}/conversation-token",
                    json={"interview_type": interview_type},
                    headers={"Authorization": f"Bearer {access_token}"},
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Success!")
                    print(f"   - Agent: {data['agent_metadata']['name']}")
                    print(f"   - Token: {data['conversation_token'][:50]}...")
                else:
                    print(f"❌ Failed with status {response.status_code}")
                    print(f"   - Error: {response.text}")
                    
            except Exception as e:
                print(f"❌ Exception: {str(e)}")
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    print("🧪 Testing Conversation Token Endpoint")
    print("=====================================")
    print("\n⚠️  Before running this test:")
    print("1. Update ACCESS_TOKEN with a valid token from your browser")
    print("2. Update INTERVIEW_ID with a valid interview ID")
    print("3. Ensure the backend server is running")
    print("\nPress Ctrl+C to cancel or wait 5 seconds to continue...")
    
    try:
        import time
        time.sleep(5)
    except KeyboardInterrupt:
        print("\n❌ Test cancelled")
        exit(0)
    
    asyncio.run(test_conversation_token())