# Testing SPARC Launchpad Hub Without AWS Integration

## Overview

This document outlines the steps to test the SPARC Launchpad Hub's authentication and verification features using mock implementations before integrating with AWS services. This allows you to verify that the UI components, client-side logic, and user flows work correctly.

## Prerequisites

1. The application is running locally (`npm run dev`)
2. The development server is accessible at http://localhost:8081/

## Test Cases

### 1. Basic Login Flow

**Test Steps:**
1. Navigate to http://localhost:8081/login
2. Enter credentials:
   - Email: `root`
   - Password: `root`
3. Click "Sign In as Member"

**Expected Result:**
- Login should succeed
- User should be redirected to `/member-dashboard`

### 1a. Password Reset Flow

**Test Steps:**
1. Navigate to http://localhost:8081/login
2. Click "Forgot your password?" link
3. Enter an email address
4. Click "Send Reset Code"
5. Enter verification code "123456" 
6. Click "Verify Code"
7. Enter a new password and confirm it
8. Click "Reset Password"

**Expected Result:**
- Reset code should be "sent" (simulated in dev mode)
- Code verification should succeed with "123456"
- Password reset should complete successfully
- User should see a success message and be able to navigate to login

### 2. Social Login Flow (Google)

**Test Steps:**
1. Navigate to http://localhost:8081/login
2. Click "Continue with Google"
3. In development mode, you should be redirected to a mock callback URL
4. The callback handler should process the mock code and simulate a successful login

**Expected Result:**
- The authentication callback page shows a success message
- User is redirected to the appropriate page (either `/complete-setup` or `/member-dashboard`)
- User information from Google is displayed in the dashboard

### 3. Social Login Flow (Microsoft)

**Test Steps:**
1. Navigate to http://localhost:8081/login
2. Click "Continue with Microsoft"
3. In development mode, you should be redirected to a mock callback URL
4. The callback handler should process the mock code and simulate a successful login

**Expected Result:**
- The authentication callback page shows a success message
- User is redirected to the appropriate page (either `/complete-setup` or `/member-dashboard`)
- User information from Microsoft is displayed in the dashboard

### 4. Email Verification Flow

**Test Steps:**
1. Navigate to http://localhost:8081/complete-setup
2. Fill in the personal information form (name, email, etc.)
3. Choose "Email" as the verification method
4. Enter a valid email
5. Click "Send Code"
6. Enter "123456" as the verification code
7. Click "Verify"

**Expected Result:**
- The UI should indicate that the verification code was sent
- Entering "123456" should successfully verify the email
- The form should allow proceeding to the next step

### 5. Phone Verification Flow

**Test Steps:**
1. Navigate to http://localhost:8081/complete-setup
2. Fill in the personal information form (name, phone, etc.)
3. Choose "Phone" as the verification method
4. Enter a valid phone number
5. Click "Send Code"
6. Enter "123456" as the verification code
7. Click "Verify"

**Expected Result:**
- The UI should indicate that the verification code was sent
- Entering "123456" should successfully verify the phone number
- The form should allow proceeding to the next step

### 6. Complete Registration Flow

**Test Steps:**
1. Step 1: Fill out the Personal Information form (name, email, etc.)
2. Click "Next" to proceed to Step 2
3. Step 2: Fill out the Educational Details form (college, branch, etc.)
4. Click "Next" to proceed to Step 3
5. Step 3: Create a secure password
   - Must be at least 8 characters
   - Should include at least one uppercase letter (recommended)
   - Should include at least one number (recommended)
   - Both password fields must match
6. Click "Next" to proceed to Step 4
7. Step 4: Complete email or phone verification
8. Click "Complete Setup" to submit the form

**Expected Result:**
- Each form step should validate correctly before allowing progression
- The "Next" button should work to move between steps
- Password requirements should be clearly displayed with visual indicators
- The form should submit successfully after verification
- User should be redirected to the dashboard
- User's profile should be marked as complete
- User should be able to use the created password for future logins

### 7. Login with Newly Created Account

**Test Steps:**
1. After completing registration, log out or open a new incognito window
2. Navigate to http://localhost:8081/login
3. Enter the email address used during registration
4. Enter the password created during registration
5. Click "Sign In as Member"

**Expected Result:**
- User should be successfully logged in
- User should be redirected to the member dashboard
- User's information from registration should be displayed

### 8. Empty State for New Users

**Test Steps:**
1. Log in with a newly created account
2. Navigate to the "My Bookings" tab in the member dashboard

**Expected Result:**
- User should see an empty state message indicating no events are registered
- Message should guide user to browse available events
- "Browse All Events" button should be displayed and functional
- No dummy/test event data should be shown for new users

**Troubleshooting Tips:**
- If unable to progress past Step 3 (password creation), ensure:
  - Password is at least 8 characters
  - Both password fields match exactly
  - No validation errors appear on the form

## Troubleshooting

### Common Issues

1. **Social Login Redirect Issues:**
   - Check that the mock OAuth URLs are correctly set up
   - Ensure AuthCallback component is properly handling the mock codes

2. **Verification Issues:**
   - Verify that the dev-mode fallbacks in AuthService are working
   - Check for any console errors during the verification process

3. **Form Submission Issues:**
   - Ensure the form data is correctly structured
   - Check for validation errors in the console

### Developer Tools

Use browser developer tools to:
- Monitor network requests
- Check console for errors
- Inspect localStorage for saved tokens and user data

## Next Steps

After verifying that all components work correctly with the mock implementations, you can proceed with AWS integration:

1. Set up AWS services (Cognito, SES, SNS) as described in the AWS setup guide
2. Configure environment variables with actual AWS credentials
3. Deploy and test with real services

## Notes

- All verification codes in development mode will accept "123456" or any 6-digit number
- Social login in development mode uses mock user data
- User data is stored in localStorage and will persist between sessions