/**
 * Native identity-token providers for Sign in with Apple / Google.
 *
 * PLACEHOLDER until the Apple Developer account exists. Each function must resolve to an
 * OpenID Connect ID token string (JWT) or null if the user cancelled. The server
 * (functions/api/auth/oauth.js) verifies the token itself; nothing here is trusted.
 *
 * Planned implementation:
 *   apple  -> expo-apple-authentication: AppleAuthentication.signInAsync({ requestedScopes: [EMAIL] })
 *             then return credential.identityToken
 *   google -> expo-auth-session/providers/google (or @react-native-google-signin) -> idToken
 */
export class SocialSignInUnavailableError extends Error {}

export async function getAppleIdToken(): Promise<string | null> {
  throw new SocialSignInUnavailableError('Sign in with Apple is not configured');
}

export async function getGoogleIdToken(): Promise<string | null> {
  throw new SocialSignInUnavailableError('Google sign-in is not configured');
}
