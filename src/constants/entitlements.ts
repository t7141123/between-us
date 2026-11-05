/**
 * Central place for what is free and what needs Plus, so screens never hard-code the rules.
 * `isPlus` comes from the user's entitlements (server-verified; see functions/api/payment/_lib.js).
 */
export const FREE_NOTE_LIMIT = 10;

export type PlusFeature =
  | 'full_note_history'
  | 'note_search_export'
  | 'cloud_backup'
  | 'custom_timer'
  | 'card_image_share'
  | 'custom_questions'
  | 'all_sessions'
  | 'reveal_room';

export interface EntitlementState {
  isPlus: boolean;
}

/** Every Plus feature is unlocked by Plus alone; the switch keeps call sites explicit and greppable. */
export function canUse(feature: PlusFeature, state: EntitlementState): boolean {
  switch (feature) {
    case 'full_note_history':
    case 'note_search_export':
    case 'cloud_backup':
    case 'custom_timer':
    case 'card_image_share':
    case 'custom_questions':
    case 'all_sessions':
    case 'reveal_room':
      return state.isPlus;
  }
}

/** Shown on the Plus tab of the store (i18n keys). */
export const PLUS_FEATURE_KEYS = [
  'plus_f_packs',
  'plus_f_skins',
  'plus_f_notes',
  'plus_f_backup',
  'plus_f_timer',
  'plus_f_share',
  'plus_f_custom',
  'plus_f_sessions',
  'plus_f_reveal',
] as const;
