#!/usr/bin/env python
import requests
import json
import time
import sys

# Configuration
BASE_URL = "http://localhost:8000"
DEV_HEADERS = {
    "x-dev-email": "test-host@example.com", 
    "x-dev-username": "Test Host", 
    "x-dev-groups": "host"
}

def print_separator():
    print("\n" + "=" * 80 + "\n")

def fetch_events():
    """Fetch events from the backend API"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/events", headers=DEV_HEADERS)
        response.raise_for_status()  # Raise exception for non-200 status codes
        return response.json()
    except Exception as e:
        print(f"Error fetching events: {str(e)}")
        return {"value": [], "Count": 0}

def display_events(events_data):
    """Display events in a formatted way"""
    if isinstance(events_data, dict):
        events = events_data.get("value", [])
        count = events_data.get("Count", 0)
    else:
        events = events_data if isinstance(events_data, list) else []
        count = len(events)
    
    print(f"Found {count} events:")
    
    for idx, event in enumerate(events):
        if not isinstance(event, dict):
            continue
            
        print(f"\n[{idx+1}] {event.get('title', 'Untitled Event')}")
        print(f"    ID: {event.get('id', 'No ID')}")
        print(f"    Date: {event.get('date_time', 'No date')}")
        print(f"    Venue: {event.get('venue', 'No venue')}")
        
        created_by = event.get('created_by', {})
        if isinstance(created_by, dict):
            print(f"    Created by: {created_by.get('name', 'Unknown')}")
        else:
            print(f"    Created by: Unknown")
        
        # Display registrations if any
        registrations = event.get('registrations', [])
        if registrations and isinstance(registrations, list):
            print(f"    Registrations: {len(registrations)}")
            for reg_idx, reg in enumerate(registrations[:5]):  # Show only first 5
                if isinstance(reg, dict):
                    user = reg.get('user', {})
                    if isinstance(user, dict):
                        print(f"      - {reg_idx+1}. {user.get('name', 'Unknown User')} ({reg.get('status', 'Unknown')})")
                    else:
                        print(f"      - {reg_idx+1}. Unknown User ({reg.get('status', 'Unknown')})")
            
            if len(registrations) > 5:
                print(f"      ... and {len(registrations) - 5} more")
        else:
            print("    No registrations yet")

def monitor_backend():
    """Continuously monitor the backend for data changes"""
    print("Starting backend data monitor...")
    print("Press Ctrl+C to stop monitoring")
    
    try:
        while True:
            print_separator()
            print(f"Current time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
            
            # Fetch and display events
            events_data = fetch_events()
            display_events(events_data)
            
            # Wait before checking again
            print("\nChecking again in 5 seconds...")
            time.sleep(5)
            
    except KeyboardInterrupt:
        print("\nMonitoring stopped by user")
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")

if __name__ == "__main__":
    print_separator()
    print("SPARC LAUNCHPAD BACKEND MONITOR")
    print_separator()
    
    monitor_backend()