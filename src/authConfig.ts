const V = import.meta.env;

export const cognitoAuthConfig = {
  authority: (V.VITE_COGNITO_AUTHORITY as string) || "",
  client_id: (V.VITE_COGNITO_CLIENT_ID as string) || "",
  redirect_uri: (V.VITE_COGNITO_REDIRECT_URI as string) || (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : "/auth/callback"),
  response_type: "code",
  scope: (V.VITE_COGNITO_SCOPE as string) || "phone openid email profile",
};
