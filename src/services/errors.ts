/**
 * Error codes returned by services. They are i18n keys: components render them with
 * `I18nService.t(locale, code)`, so no user-facing text lives in the service layer.
 */
export type ErrorCode =
  | 'err_network'
  | 'err_generic'
  | 'err_invalid_email'
  | 'err_weak_password'
  | 'err_email_exists'
  | 'err_account_not_found'
  | 'err_social_account'
  | 'err_wrong_password'
  | 'err_unavailable'
  | 'err_unauthorized'
  | 'err_delete_failed'
  | 'err_delete_network'
  | 'err_room_create'
  | 'err_room_join'
  | 'err_room_not_found'
  | 'err_checkout'
  | 'err_iap_sync'
  | 'err_transaction_claimed';

const SERVER_CODES: Record<string, ErrorCode> = {
  invalid_email: 'err_invalid_email',
  weak_password: 'err_weak_password',
  email_exists: 'err_email_exists',
  account_not_found: 'err_account_not_found',
  social_account: 'err_social_account',
  wrong_password: 'err_wrong_password',
  unavailable: 'err_unavailable',
};

/** Maps a failed HTTP response (server `code` field first, then status) to an ErrorCode. */
export async function errorFromResponse(res: Response, fallback: ErrorCode = 'err_generic'): Promise<ErrorCode> {
  const body = (await res.json().catch(() => ({}))) as { code?: string };
  if (body.code && SERVER_CODES[body.code]) return SERVER_CODES[body.code];
  if (res.status === 401) return 'err_unauthorized';
  if (res.status === 409) return 'err_transaction_claimed';
  if (res.status === 501 || res.status === 503) return 'err_unavailable';
  return fallback;
}
