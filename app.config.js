/**
 * Extends app.json. Registers the Google iOS client's reversed id as an extra URL scheme (needed for
 * Google sign-in redirects) when EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is provided at build time.
 */
module.exports = ({ config }) => {
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (!googleClientId) return config;
  const reversed = googleClientId.split('.').reverse().join('.');
  const schemes = [].concat(config.scheme || []);
  return { ...config, scheme: [...schemes, reversed] };
};
