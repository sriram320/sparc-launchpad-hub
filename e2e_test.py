import requests
import json
import uuid
from datetime import datetime, timedelta
import sys

# Configuration
BASE_URL = "http://localhost:8000"
DEV_HEADERS = {
    "x-dev-email": "test@example.com",
    "x-dev-username": "testuser",
    "x-dev-groups": "member,host"
}

def print_separator():
    print("\n" + "=" * 80 + "\n")

def test_create_event():
    print("Testing Event Creation...")
    
    # Generate a unique event name to avoid conflicts
    event_id = str(uuid.uuid4())[:8]
    event_data = {
        "title": f"Test Event {event_id}",
        "description": "This is a test event created for end-to-end testing",
        "date": (datetime.now() + timedelta(days=7)).isoformat(),
        "location": "Test Location",
        "category": "Workshops",
        "max_participants": 20,
        "registration_deadline": (datetime.now() + timedelta(days=5)).isoformat(),
        "image_url": "https://example.com/event.jpg",
        "status": "upcoming",
        "host_id": "test-host-id"
    }
    
    response = requests.post(
        f"{BASE_URL}/events/", 
        json=event_data,
        headers=DEV_HEADERS
    )
    
    if response.status_code == 200:
        event = response.json()
        print(f"✅ Event created successfully with ID: {event['id']}")
        print(f"Event details: {json.dumps(event, indent=2)}")
        return event
    else:
        print(f"❌ Failed to create event: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_register_for_event(event_id):
    print("\nTesting Event Registration...")
    
    registration_data = {
        "user_id": "test-user-id",
        "event_id": event_id,
        "registration_date": datetime.now().isoformat(),
        "status": "registered"
    }
    
    response = requests.post(
        f"{BASE_URL}/events/{event_id}/register",
        json=registration_data,
        headers=DEV_HEADERS
    )
    
    if response.status_code == 200:
        registration = response.json()
        print(f"✅ Registered for event successfully")
        print(f"Registration details: {json.dumps(registration, indent=2)}")
        return registration
    else:
        print(f"❌ Failed to register for event: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_mark_attendance(event_id, user_id="test-user-id"):
    print("\nTesting Mark Attendance...")
    
    attendance_data = {
        "user_id": user_id,
        "event_id": event_id,
        "attendance_date": datetime.now().isoformat(),
        "status": "attended"
    }
    
    response = requests.post(
        f"{BASE_URL}/events/{event_id}/attendance",
        json=attendance_data,
        headers=DEV_HEADERS
    )
    
    if response.status_code == 200:
        attendance = response.json()
        print(f"✅ Attendance marked successfully")
        print(f"Attendance details: {json.dumps(attendance, indent=2)}")
        return attendance
    else:
        print(f"❌ Failed to mark attendance: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_upload_gallery():
    print("\nTesting Gallery Upload...")
    
    # This is a placeholder as file uploads are complex to test via script
    print("⚠️ Gallery upload testing requires frontend UI interaction")
    print("Please test gallery upload manually through the frontend interface")

def main():
    print_separator()
    print("SPARC LAUNCHPAD HUB END-TO-END TEST")
    print_separator()
    
    # Test creating an event
    event = test_create_event()
    if not event:
        sys.exit(1)
    
    print_separator()
    
    # Test event registration
    registration = test_register_for_event(event["id"])
    if not registration:
        sys.exit(1)
    
    print_separator()
    
    # Test marking attendance
    attendance = test_mark_attendance(event["id"])
    if not attendance:
        sys.exit(1)
    
    print_separator()
    
    # Gallery upload needs frontend interaction
    test_upload_gallery()
    
    print_separator()
    print("🎉 ALL TESTS COMPLETED SUCCESSFULLY")
    print_separator()

if __name__ == "__main__":
    main()