// Lightweight client-side helpers for Cognito email/phone verification and password reset
// Uses AWS SDK v3 in the browser. These operations (SignUp/Confirm/Forgot) do not require AWS credentials.
// Make sure to set these env vars (in Amplify and local .env):
// - VITE_COGNITO_REGION
// - VITE_COGNITO_USER_POOL_ID (optional for these flows)
// - VITE_COGNITO_APP_CLIENT_ID

import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const V = import.meta.env as Record<string, string>;

const REGION = V.VITE_COGNITO_REGION;
// Prefer APP client id, but fall back to CLIENT_ID to support hosted UI setups
const CLIENT_ID = V.VITE_COGNITO_APP_CLIENT_ID || V.VITE_COGNITO_CLIENT_ID; // required for all flows here

function ensureEnv() {
  if (!REGION) throw new Error('Missing VITE_COGNITO_REGION');
  if (!CLIENT_ID) throw new Error('Missing VITE_COGNITO_APP_CLIENT_ID');
}

function client() {
  ensureEnv();
  return new CognitoIdentityProviderClient({ region: REGION });
}

// 1) Sign up (email only or email + phone_number)
export async function cognitoSignUp(params: {
  email: string;
  password: string;
  phone_number?: string; // E.164 like +91XXXXXXXXXX
  given_name?: string;
  family_name?: string;
}) {
  const { email, password, phone_number, given_name, family_name } = params;
  const UserAttributes: Array<{ Name: string; Value: string }> = [{ Name: 'email', Value: email }];
  if (phone_number) UserAttributes.push({ Name: 'phone_number', Value: phone_number });
  if (given_name) UserAttributes.push({ Name: 'given_name', Value: given_name });
  if (family_name) UserAttributes.push({ Name: 'family_name', Value: family_name });

  const cmd = new SignUpCommand({ ClientId: CLIENT_ID, Username: email, Password: password, UserAttributes });
  const resp = await client().send(cmd);
  return {
    userConfirmed: resp.UserConfirmed ?? false,
    codeDelivery: resp.CodeDeliveryDetails,
  };
}

// 2) Confirm signup with code
export async function cognitoConfirmSignUp(username: string, confirmationCode: string) {
  const cmd = new ConfirmSignUpCommand({ ClientId: CLIENT_ID, Username: username, ConfirmationCode: confirmationCode });
  await client().send(cmd);
  return { success: true };
}

// 3) Resend confirmation code
export async function cognitoResendCode(username: string) {
  const cmd = new ResendConfirmationCodeCommand({ ClientId: CLIENT_ID, Username: username });
  const resp = await client().send(cmd);
  return { success: true, codeDelivery: resp.CodeDeliveryDetails };
}

// 4) Forgot password (send code to email or phone)
export async function cognitoForgotPassword(username: string) {
  const cmd = new ForgotPasswordCommand({ ClientId: CLIENT_ID, Username: username });
  const resp = await client().send(cmd);
  return { success: true, codeDelivery: resp.CodeDeliveryDetails };
}

// 5) Confirm new password with code
export async function cognitoConfirmForgotPassword(username: string, confirmationCode: string, newPassword: string) {
  const cmd = new ConfirmForgotPasswordCommand({
    ClientId: CLIENT_ID,
    Username: username,
    ConfirmationCode: confirmationCode,
    Password: newPassword,
  });
  await client().send(cmd);
  return { success: true };
}

// Usage example (in your components/services):
// await cognitoSignUp({ email, password });
// await cognitoConfirmSignUp(email, code);
// await cognitoForgotPassword(email);
// await cognitoConfirmForgotPassword(email, code, newPassword);
