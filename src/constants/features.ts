/**
 * Feature switches for functionality that needs external accounts before it can ship.
 *
 * SOCIAL_SIGN_IN_ENABLED
 *   Apple and Google buttons are shown/hidden TOGETHER (App Store guideline 4.8: an app that
 *   offers Google sign-in must also offer Sign in with Apple). Turn on only after:
 *     1. Apple Developer Program is active, bundle id has the "Sign in with Apple" capability.
 *     2. APPLE_CLIENT_IDS / GOOGLE_CLIENT_IDS are set on the Cloudflare Pages project.
 *     3. src/services/oauthNative.ts has real implementations.
 */
export const SOCIAL_SIGN_IN_ENABLED = false;
