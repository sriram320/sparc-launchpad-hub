# User Registration & Login Testing Guide

This document provides a comprehensive guide for testing the user registration and login flow in the SPARC Club application.

## Development Environment Setup

In development mode, the application uses browser localStorage to simulate user authentication. This allows for testing the complete registration and login flow without requiring backend connectivity.

## User Registration Testing

### 1. Complete Registration Flow

**Pre-requisites:**
- Application running on localhost:8081
- No active user session (logged out state)

**Test Steps:**

1. Navigate to http://localhost:8081/onboarding
2. **Step 1: Personal Information**
   - Enter your full name
   - Enter a valid email address (e.g., `test@example.com`)
   - Select your gender
   - Click "Next"

3. **Step 2: Educational Details**
   - Enter your college name
   - Select your branch
   - Enter your graduation year
   - Click "Next"

4. **Step 3: Create Password**
   - Enter a password that meets all requirements:
     - At least 8 characters
     - Includes uppercase letter
     - Includes number
     - Includes special character
   - Confirm the same password
   - Verify all password requirement indicators turn green
   - Click "Next"

5. **Step 4: Verification**
   - In development mode, verification is automatically approved
   - Click "Complete Setup"

**Expected Results:**
- Registration completes successfully
- User is redirected to the member dashboard
- User information appears in the profile section
- User credentials are stored in localStorage (development mode only)

## Login Testing

### 2. Login with Newly Created Account

**Pre-requisites:**
- Completed registration flow
- Logged out state

**Test Steps:**
1. Navigate to http://localhost:8081/login
2. Enter the email address used during registration
3. Enter the password created during registration
4. Click "Sign In as Member"

**Expected Results:**
- User should be successfully authenticated
- User should be redirected to the member dashboard
- User's name and profile information should be displayed correctly
- Authentication token should be stored in localStorage

### 3. Login with Demo Credentials

**Test Steps:**
1. Navigate to http://localhost:8081/login
2. Enter email: `root`
3. Enter password: `root`
4. Click "Sign In as Member"

**Alternative Demo Account:**
- Email: `sriram@gmail.com`
- Password: `root`

**Expected Results:**
- Demo user should be successfully authenticated
- Demo user should see pre-populated event data in their dashboard

## Empty State Testing

### 4. New User Empty State

**Pre-requisites:**
- Logged in with newly created account (not demo account)

**Test Steps:**
1. Navigate to the "My Bookings" tab in the member dashboard

**Expected Results:**
- User should see an empty state message: "Welcome to SPARC Club!"
- Message should indicate that no events have been registered
- "Browse All Events" button should be visible and functional
- "Return to Home" button should be visible and functional
- No dummy event data should be displayed

### 5. Event Registration

**Test Steps:**
1. From the empty state, click on "Browse All Events"
2. Select an available event
3. Click "Register" on the event details page
4. Complete any required registration information
5. Submit the registration form
6. Return to "My Bookings" tab

**Expected Results:**
- The registered event should now appear in the "My Bookings" section
- Empty state message should no longer be visible
- Event details should be displayed correctly

## Troubleshooting

If issues occur during testing, check the following:

1. **localStorage Inspection:**
   - Open browser developer tools (F12)
   - Go to the Application tab
   - Check localStorage for:
     - `devEmail`: Should contain registered email
     - `devPassword`: Should contain registered password
     - `devUsername`: Should contain registered name
     - `authToken`: Should exist after successful login

2. **Console Errors:**
   - Check for any error messages in the browser console
   - Look for authentication failures or data loading issues

3. **Common Issues:**
   - Ensure all form fields meet validation requirements
   - Password must satisfy all complexity requirements
   - Check case sensitivity in email and password during login