/**
 * Feature switches.
 *
 * Social sign-in (App Store guideline 4.8): any app offering Google sign-in must also offer
 * Sign in with Apple, so the buttons are decided together here:
 *   - iOS: Sign in with Apple is always offered; Google is added only when its client id is configured.
 *   - Elsewhere (web/Android): not offered; email + password remains available.
 */
import { isAppleSignInSupported, isGoogleSignInConfigured } from '../services/oauthNative';

export const APPLE_SIGN_IN_ENABLED = isAppleSignInSupported();
export const GOOGLE_SIGN_IN_ENABLED = isGoogleSignInConfigured() && APPLE_SIGN_IN_ENABLED;
export const SOCIAL_SIGN_IN_ENABLED = APPLE_SIGN_IN_ENABLED;
