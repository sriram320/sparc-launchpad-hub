// End-to-End Test Script for SPARC Launchpad Hub
// This script tests event creation, registration, and attendance marking

// Replace with the real API URL
const API_BASE_URL = 'http://localhost:8000/api/v1';
const DEV_HEADERS = {
  'x-dev-email': 'test-host@example.com',
  'x-dev-username': 'Test Host',
  'x-dev-groups': 'host'
};

// Test user info
const TEST_USER = {
  email: 'test-member@example.com',
  name: 'Test Member',
  role: 'member'
};

// Test event info
const TEST_EVENT = {
  title: 'E2E Test Event - Created ' + new Date().toLocaleString(),
  description: 'This event was created during end-to-end testing',
  date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // One week from now
  venue: 'Testing Auditorium',
  is_paid: false,
  price: 0,
  capacity: 50
};

// Store test IDs for later use
let createdEventId = null;
let createdUserId = null;
let createdRegistrationId = null;

async function runTests() {
  console.log('🚀 Starting End-to-End Tests');
  
  try {
    // 1. Create a new event
    console.log('\n📝 Step 1: Creating a new event...');
    const eventResponse = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...DEV_HEADERS
      },
      body: JSON.stringify(TEST_EVENT)
    });
    
    if (!eventResponse.ok) {
      throw new Error(`Failed to create event: ${eventResponse.status} ${eventResponse.statusText}`);
    }
    
    const eventData = await eventResponse.json();
    createdEventId = eventData.id;
    console.log(`✅ Event created successfully with ID: ${createdEventId}`);
    console.log('Event details:', eventData);

    // 2. List all events to confirm the new one was added
    console.log('\n📝 Step 2: Listing all events...');
    const eventsResponse = await fetch(`${API_BASE_URL}/events`, {
      headers: DEV_HEADERS
    });
    
    if (!eventsResponse.ok) {
      throw new Error(`Failed to list events: ${eventsResponse.status} ${eventsResponse.statusText}`);
    }
    
    const eventsData = await eventsResponse.json();
    console.log(`✅ Found ${eventsData.value.length} events`);
    const createdEvent = eventsData.value.find(event => event.id === createdEventId);
    if (createdEvent) {
      console.log('Our new event was found in the list:', createdEvent.title);
    } else {
      console.warn('⚠️ Our new event was not found in the events list');
    }

    // 3. Create a test user (or find if exists)
    console.log('\n📝 Step 3: Creating/finding test member user...');
    // We'll use the member registration endpoint directly rather than creating a user manually
    
    // 4. Register the test user for the event
    console.log('\n📝 Step 4: Registering for the event...');
    const registrationResponse = await fetch(`${API_BASE_URL}/events/${createdEventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-dev-email': TEST_USER.email,
        'x-dev-username': TEST_USER.name,
        'x-dev-groups': TEST_USER.role
      }
    });
    
    if (!registrationResponse.ok) {
      throw new Error(`Failed to register for event: ${registrationResponse.status} ${registrationResponse.statusText}`);
    }
    
    const registrationData = await registrationResponse.json();
    createdRegistrationId = registrationData.id;
    console.log(`✅ Registration successful with ID: ${createdRegistrationId}`);
    console.log('Registration details:', registrationData);

    // 5. Get all registrations for the event
    console.log('\n📝 Step 5: Getting event registrations...');
    const eventRegistrationsResponse = await fetch(`${API_BASE_URL}/events/${createdEventId}/registrations`, {
      headers: DEV_HEADERS
    });
    
    if (!eventRegistrationsResponse.ok) {
      throw new Error(`Failed to get event registrations: ${eventRegistrationsResponse.status} ${eventRegistrationsResponse.statusText}`);
    }
    
    const eventRegistrationsData = await eventRegistrationsResponse.json();
    console.log(`✅ Found ${eventRegistrationsData.length} registrations for the event`);
    console.log('Registrations:', eventRegistrationsData);

    // 6. Mark attendance for the user
    console.log('\n📝 Step 6: Marking attendance...');
    const attendanceResponse = await fetch(`${API_BASE_URL}/events/${createdEventId}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...DEV_HEADERS
      },
      body: JSON.stringify({
        registration_id: createdRegistrationId
      })
    });
    
    if (!attendanceResponse.ok) {
      throw new Error(`Failed to mark attendance: ${attendanceResponse.status} ${attendanceResponse.statusText}`);
    }
    
    const attendanceData = await attendanceResponse.json();
    console.log('✅ Attendance marked successfully');
    console.log('Attendance details:', attendanceData);

    // 7. Check that attendance was recorded
    console.log('\n📝 Step 7: Verifying attendance was recorded...');
    const updatedRegistrationsResponse = await fetch(`${API_BASE_URL}/events/${createdEventId}/registrations`, {
      headers: DEV_HEADERS
    });
    
    if (!updatedRegistrationsResponse.ok) {
      throw new Error(`Failed to get updated registrations: ${updatedRegistrationsResponse.status} ${updatedRegistrationsResponse.statusText}`);
    }
    
    const updatedRegistrationsData = await updatedRegistrationsResponse.json();
    const ourRegistration = updatedRegistrationsData.find(reg => reg.id === createdRegistrationId);
    if (ourRegistration && ourRegistration.attended) {
      console.log('✅ Attendance was successfully recorded!');
    } else {
      console.warn('⚠️ Attendance was not properly recorded');
    }

    // Test completed!
    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
runTests();