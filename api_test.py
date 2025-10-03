import requests
import json
import uuid
from datetime import datetime, timedelta
import sys
import time

# Configuration
BASE_URL = "http://localhost:8000"
DEV_HEADERS_HOST = {
    "x-dev-email": "test-host@example.com",
    "x-dev-username": "Test Host",
    "x-dev-groups": "host"
}

DEV_HEADERS_MEMBER = {
    "x-dev-email": "test-member@example.com",
    "x-dev-username": "Test Member",
    "x-dev-groups": "member"
}

DEV_HEADERS = DEV_HEADERS_HOST  # Default to host for most operations

def print_separator():
    print("\n" + "=" * 80 + "\n")

def test_api_root():
    print("Testing API Root...")
    
    response = requests.get(
        f"{BASE_URL}/",
        headers=DEV_HEADERS
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ API root accessed successfully")
        print(f"Response: {json.dumps(data, indent=2)}")
        return True
    else:
        print(f"❌ Failed to access API root: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_api_health():
    print("\nTesting API Health...")
    
    response = requests.get(
        f"{BASE_URL}/health",
        headers=DEV_HEADERS
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ API health check successful")
        print(f"Response: {json.dumps(data, indent=2)}")
        return True
    else:
        print(f"❌ Failed to check API health: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_user_auth():
    print("\nTesting User Authentication...")
    
    # Try to access a protected endpoint with dev headers
    response = requests.get(
        f"{BASE_URL}/users/me",
        headers=DEV_HEADERS
    )
    
    if response.status_code == 200:
        user = response.json()
        print(f"✅ User authentication successful")
        print(f"User details: {json.dumps(user, indent=2)}")
        return user
    else:
        print(f"❌ Failed to authenticate user: {response.status_code}")
        print(f"Response: {response.text}")
        try_alt_endpoint = requests.get(
            f"{BASE_URL}/auth/me",
            headers=DEV_HEADERS
        )
        if try_alt_endpoint.status_code == 200:
            user = try_alt_endpoint.json()
            print(f"✅ User authentication successful via alternate endpoint")
            print(f"User details: {json.dumps(user, indent=2)}")
            return user
        return None

def test_get_events():
    print("\nFetching Events from API...")
    
    response = requests.get(
        f"{BASE_URL}/api/v1/events",
        headers=DEV_HEADERS
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Successfully retrieved {data.get('Count', 0)} events")
        
        # Print details of each event
        for idx, event in enumerate(data.get('value', [])):
            print(f"\nEvent #{idx + 1}:")
            print(f"  ID: {event.get('id')}")
            print(f"  Title: {event.get('title')}")
            print(f"  Description: {event.get('description')}")
            print(f"  Date: {event.get('date_time')}")
            print(f"  Venue: {event.get('venue')}")
            print(f"  Created by: {event.get('created_by', {}).get('name')}")
            print(f"  Registrations: {len(event.get('registrations', []))}")
        
        return data.get('value', [])
    else:
        print(f"❌ Failed to retrieve events: {response.status_code}")
        print(f"Response: {response.text}")
        return []

def test_event_registration(event_id):
    print(f"\nTesting Registration for Event {event_id}...")
    
    # Using member headers for registration
    registration_data = {
        "event_id": event_id
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/events/{event_id}/register",
        json=registration_data,
        headers=DEV_HEADERS_MEMBER
    )
    
    if response.status_code in [200, 201]:
        registration = response.json()
        print(f"✅ Successfully registered for event")
        print(f"Registration details: {json.dumps(registration, indent=2)}")
        return registration
    else:
        print(f"❌ Failed to register for event: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_mark_attendance(event_id, user_email="test-member@example.com"):
    print(f"\nTesting Mark Attendance for Event {event_id}...")
    
    # Using host headers for marking attendance
    attendance_data = {
        "user_email": user_email,
        "event_id": event_id
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/events/{event_id}/attendance",
        json=attendance_data,
        headers=DEV_HEADERS_HOST
    )
    
    if response.status_code in [200, 201]:
        attendance = response.json()
        print(f"✅ Successfully marked attendance")
        print(f"Attendance details: {json.dumps(attendance, indent=2)}")
        return attendance
    else:
        print(f"❌ Failed to mark attendance: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def monitor_backend_data(interval=5, duration=60):
    """
    Monitor backend data for a specified duration, checking at regular intervals
    """
    print(f"\nMonitoring backend data for {duration} seconds (checking every {interval} seconds)...")
    
    start_time = time.time()
    end_time = start_time + duration
    
    while time.time() < end_time:
        current_time = time.strftime("%H:%M:%S", time.localtime())
        print(f"\n[{current_time}] Checking backend data...")
        
        # Get events
        events = test_get_events()
        
        # Wait for the next check
        time_left = end_time - time.time()
        if time_left <= 0:
            break
            
        next_check = min(interval, time_left)
        print(f"\nWaiting {int(next_check)} seconds for next check...")
        time.sleep(next_check)
    
    print("\nMonitoring complete.")

def main():
    print_separator()
    print("SPARC LAUNCHPAD HUB API TEST")
    print_separator()
    
    # Test API root
    if not test_api_root():
        sys.exit(1)
    
    print_separator()
    
    # Test API health
    test_api_health()
    
    print_separator()
    
    # Test user authentication
    test_user_auth()
    
    print_separator()
    
    # Get events
    events = test_get_events()
    
    if events:
        # Select the first event for testing
        test_event = events[0]
        event_id = test_event["id"]
        
        # Test registration (as a member)
        test_event_registration(event_id)
        
        # Test marking attendance (as a host)
        test_mark_attendance(event_id)
    
    print_separator()
    print("Would you like to monitor backend data continuously? (y/n)")
    choice = input().lower()
    if choice == 'y':
        monitor_backend_data(interval=5, duration=300)  # Monitor for 5 minutes
    
    print_separator()
    print("🎉 API TESTS COMPLETED")
    print_separator()
    user = test_user_auth()
    if not user:
        # Auth endpoint might be different, continue anyway
        pass
    
    print_separator()
    print("🎉 BASIC API TESTS COMPLETED")
    print("Note: Complete end-to-end testing requires manual verification through the frontend")
    print_separator()

if __name__ == "__main__":
    main()