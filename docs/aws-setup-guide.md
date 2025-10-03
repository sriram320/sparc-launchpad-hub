# AWS Authentication & Verification Setup Guide

This guide provides detailed instructions for setting up AWS services to enable email/phone verification and social login (Google, Microsoft) for the SPARC Launchpad Hub.

## Prerequisites

1. An AWS account
2. AWS CLI installed and configured
3. Google Developer Console access (for Google OAuth)
4. Microsoft Azure Portal access (for Microsoft OAuth)

## Step 1: AWS Cognito Setup

AWS Cognito will be used for user management and authentication.

### Create a User Pool

1. Go to the AWS Cognito Console
2. Click "Create user pool"
3. Choose "Email" and "Phone number" as sign-in options
4. Configure security requirements (password policy, MFA, etc.)
5. Configure app clients:
   - Create an app client for your web app
   - Enable all authentication flows
   - Save the App Client ID
6. Create the user pool and note the User Pool ID

### Set up user groups

1. In your user pool, go to "Groups"
2. Create two groups:
   - "member" - Regular users
   - "host" - Event organizers/administrators

## Step 2: Amazon SES Setup (Email Verification)

1. Go to the Amazon SES Console
2. Verify your email domain or at least an email address to send verification emails
3. If in sandbox mode, also verify recipient email addresses for testing
4. Create an email template for verification emails

## Step 3: Amazon SNS Setup (Phone Verification)

1. Go to the Amazon SNS Console
2. Set up SMS messaging
3. Request production access to remove SMS limitations
4. Create an SMS template for verification messages

## Step 4: IAM Permissions

Create an IAM user or role with permissions for:

1. Cognito User Pool operations
2. SES email sending
3. SNS SMS sending

The minimum policy should include:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminUpdateUserAttributes",
                "cognito-idp:AdminAddUserToGroup",
                "cognito-idp:AdminListGroupsForUser",
                "cognito-idp:ListUsers"
            ],
            "Resource": "arn:aws:cognito-idp:REGION:ACCOUNT_ID:userpool/USER_POOL_ID"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendTemplatedEmail"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "sns:Publish"
            ],
            "Resource": "*"
        }
    ]
}
```

## Step 5: OAuth Provider Setup

### Google OAuth

1. Go to the Google Cloud Console
2. Create a new project
3. Go to "APIs & Services" > "Credentials"
4. Create an OAuth client ID for a web application
5. Configure the authorized redirect URIs to include:
   - `http://localhost:5173/auth/google/callback` (for development)
   - `https://sparclaunchpad.org/auth/google/callback` (for production)
6. Note the Client ID and Client Secret

### Microsoft OAuth

1. Go to the Microsoft Azure Portal
2. Navigate to "Azure Active Directory" > "App registrations"
3. Register a new application
4. Set up the redirect URIs to include:
   - `http://localhost:5173/auth/microsoft/callback` (for development)
   - `https://sparclaunchpad.org/auth/microsoft/callback` (for production)
5. Create a client secret
6. Note the Client ID and Client Secret

## Step 6: Environment Configuration

Update your .env file with the following variables:

```
# AWS Configuration
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_COGNITO_USER_POOL_ID=your-user-pool-id
AWS_COGNITO_APP_CLIENT_ID=your-app-client-id
AWS_SES_SENDER_EMAIL=your-verified-email

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Microsoft OAuth
MS_CLIENT_ID=your-microsoft-client-id
MS_CLIENT_SECRET=your-microsoft-client-secret
MS_REDIRECT_URI=http://localhost:5173/auth/microsoft/callback
```

## Step 7: Testing the Integration

1. Start your backend server
2. Test the verification endpoints:
   - `/api/v1/auth/verification/send`
   - `/api/v1/auth/verification/verify`
3. Test the social login flows:
   - `/api/v1/auth/google/login`
   - `/api/v1/auth/microsoft/login`

## Development Mode

In development mode, the application will:
- Mock verification codes using in-memory storage
- Provide mock OAuth flows with test user data
- Skip actual AWS service calls while maintaining the same API contract

To enable development mode, set `ENVIRONMENT=development` and `MOCK_VERIFICATION=true` in your .env file.