import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
EVENT_ID = "470ec766-899f-435a-b559-5fb57d7c8356"

# Headers for dev authentication
DEV_HEADERS_MEMBER = {
    "x-dev-email": "test-member@example.com",
    "x-dev-username": "Test Member",
    "x-dev-groups": "member",
    "Content-Type": "application/json"
}

DEV_HEADERS_HOST = {
    "x-dev-email": "test-host@example.com",
    "x-dev-username": "Test Host",
    "x-dev-groups": "host",
    "Content-Type": "application/json"
}

def print_separator():
    print("\n" + "=" * 80 + "\n")

def create_test_user():
    """Create a test member user if it doesn't exist"""
    print("Creating test member user...")
    
    user_data = {
        "name": "Test Member",
        "email": "test-member@example.com",
        "role": "member"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/users", 
            headers=DEV_HEADERS_HOST,  # Using host permissions to create user
            json=user_data
        )
        
        if response.status_code in [200, 201]:
            print(f"✅ Test member user created or already exists")
            print(f"User details: {json.dumps(response.json(), indent=2)}")
            return response.json()
        else:
            print(f"⚠️ Could not create test user: {response.status_code}")
            print(f"Response: {response.text}")
            # Continue anyway as the user might already exist
            return None
            
    except Exception as e:
        print(f"Error creating test user: {str(e)}")
        return None

def register_member_for_event():
    """Register the test member for the event"""
    print(f"Registering test member for event {EVENT_ID}...")
    
    registration_data = {
        "event_id": EVENT_ID
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/events/{EVENT_ID}/register", 
            headers=DEV_HEADERS_MEMBER,
            json=registration_data
        )
        
        if response.status_code in [200, 201]:
            print(f"✅ Successfully registered for event")
            print(f"Registration details: {json.dumps(response.json(), indent=2)}")
            return response.json()
        else:
            print(f"❌ Failed to register for event: {response.status_code}")
            print(f"Response: {response.text}")
            
            # Try alternative endpoint
            print("Trying alternative registration method...")
            alt_response = requests.post(
                f"{BASE_URL}/registrations", 
                headers=DEV_HEADERS_HOST,  # Using host permissions
                json={"event_id": EVENT_ID, "user_email": "test-member@example.com"}
            )
            
            if alt_response.status_code in [200, 201]:
                print(f"✅ Successfully registered using alternative method")
                print(f"Registration details: {json.dumps(alt_response.json(), indent=2)}")
                return alt_response.json()
            else:
                print(f"❌ Failed with alternative method: {alt_response.status_code}")
                print(f"Response: {alt_response.text}")
                return None
            
    except Exception as e:
        print(f"Error registering for event: {str(e)}")
        return None

def verify_registration():
    """Verify that the registration exists in the event's registrations"""
    print(f"Verifying registration for event {EVENT_ID}...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/events/{EVENT_ID}", 
            headers=DEV_HEADERS_HOST
        )
        
        if response.status_code == 200:
            event = response.json()
            registrations = event.get("registrations", [])
            
            member_registrations = [r for r in registrations if r.get("user", {}).get("email") == "test-member@example.com"]
            
            if member_registrations:
                print(f"✅ Found {len(member_registrations)} registrations for test-member@example.com")
                print(f"Registration details: {json.dumps(member_registrations[0], indent=2)}")
                return True
            else:
                print(f"❌ No registrations found for test-member@example.com")
                return False
        else:
            print(f"❌ Failed to get event: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error verifying registration: {str(e)}")
        return False

def main():
    print_separator()
    print("SPARC LAUNCHPAD HUB - CREATE TEST REGISTRATION")
    print_separator()
    
    # Create test user (if needed)
    create_test_user()
    
    print_separator()
    
    # Register test member for the event
    registration = register_member_for_event()
    
    print_separator()
    
    # Verify the registration
    if verify_registration():
        print("\n🎉 Test registration created successfully!")
    else:
        print("\n⚠️ Could not verify test registration. Check logs above for details.")
    
    print_separator()

if __name__ == "__main__":
    main()