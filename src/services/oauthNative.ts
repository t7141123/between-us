/**
 * Native identity-token providers for Sign in with Apple / Google (iOS).
 *
 * Each function resolves to credentials, or null when the user cancelled, and throws
 * SocialSignInUnavailableError when the provider cannot be used in this build/configuration.
 * The server (functions/api/auth/oauth.js) verifies every token itself; nothing here is trusted.
 *
 * Google needs EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (an OAuth client of type "iOS" whose bundle id is
 * com.lovebetweenus.app). app.config.js registers its reversed form as the redirect URL scheme.
 */
import { Platform } from 'react-native';

export class SocialSignInUnavailableError extends Error {}

export interface SocialCredential {
  idToken: string;
  /** Apple only: short-lived code the server exchanges for a refresh token (for revocation on delete). */
  authorizationCode?: string;
}

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export function isAppleSignInSupported(): boolean {
  return Platform.OS === 'ios';
}

export function isGoogleSignInConfigured(): boolean {
  return Platform.OS === 'ios' && Boolean(GOOGLE_IOS_CLIENT_ID);
}

export async function getAppleCredential(): Promise<SocialCredential | null> {
  if (!isAppleSignInSupported()) throw new SocialSignInUnavailableError('Apple sign-in is iOS only');
  const Apple = await import('expo-apple-authentication');
  if (!(await Apple.isAvailableAsync())) throw new SocialSignInUnavailableError('Apple sign-in unavailable');
  try {
    const credential = await Apple.signInAsync({
      requestedScopes: [Apple.AppleAuthenticationScope.EMAIL, Apple.AppleAuthenticationScope.FULL_NAME],
    });
    if (!credential.identityToken) throw new SocialSignInUnavailableError('No identity token');
    return {
      idToken: credential.identityToken,
      authorizationCode: credential.authorizationCode ?? undefined,
    };
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return null;
    throw e;
  }
}

export async function getGoogleCredential(): Promise<SocialCredential | null> {
  if (!isGoogleSignInConfigured() || !GOOGLE_IOS_CLIENT_ID) {
    throw new SocialSignInUnavailableError('Google sign-in is not configured');
  }
  const AuthSession = await import('expo-auth-session');
  const WebBrowser = await import('expo-web-browser');
  WebBrowser.maybeCompleteAuthSession();

  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  };
  // iOS OAuth clients use the reversed client id as the redirect scheme.
  const reversed = GOOGLE_IOS_CLIENT_ID.split('.').reverse().join('.');
  const redirectUri = `${reversed}:/oauthredirect`;

  const request = new AuthSession.AuthRequest({
    clientId: GOOGLE_IOS_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  });
  const result = await request.promptAsync(discovery);
  if (result.type !== 'success' || !result.params.code) return null;

  const token = await AuthSession.exchangeCodeAsync(
    {
      clientId: GOOGLE_IOS_CLIENT_ID,
      code: result.params.code,
      redirectUri,
      extraParams: { code_verifier: request.codeVerifier ?? '' },
    },
    discovery
  );
  if (!token.idToken) throw new SocialSignInUnavailableError('No Google id token');
  return { idToken: token.idToken };
}
