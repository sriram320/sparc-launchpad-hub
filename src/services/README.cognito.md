Frontend Cognito helpers
========================

Install dependency (in the frontend root):

```
npm i @aws-sdk/client-cognito-identity-provider
```

Environment variables to set (Amplify > App settings > Environment variables, and local .env for dev):

```
VITE_COGNITO_REGION=ap-south-1
VITE_COGNITO_APP_CLIENT_ID=59ukfoavbn7omo7hkh8d7l2om8
```

Optional (if you wire Hosted UI elsewhere):

```
VITE_COGNITO_AUTHORITY=https://<your-domain>.auth.ap-south-1.amazoncognito.com
VITE_COGNITO_REDIRECT_URI=https://master.d2f6f9olv1emsk.amplifyapp.com/auth/callback
VITE_COGNITO_SCOPE="phone openid email profile"
```

APIs exposed in `src/services/cognito.ts`:

- cognitoSignUp({ email, password, phone_number?, given_name?, family_name? })
- cognitoConfirmSignUp(username, code)
- cognitoResendCode(username)
- cognitoForgotPassword(username)
- cognitoConfirmForgotPassword(username, code, newPassword)

These are client-side and do not require AWS credentials to execute.
