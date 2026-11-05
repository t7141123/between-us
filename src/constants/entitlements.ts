/**
 * Central place for what is free and what needs Plus, so screens never hard-code the rules.
 * `isPlus` comes from the user's entitlements (Plus is introduced in a later release; until then
 * it is always false and the free limits apply).
 */
export const FREE_NOTE_LIMIT = 10;

export type PlusFeature = 'full_note_history' | 'note_search_export';

export interface EntitlementState {
  isPlus: boolean;
}

export function canUse(feature: PlusFeature, state: EntitlementState): boolean {
  switch (feature) {
    case 'full_note_history':
    case 'note_search_export':
      return state.isPlus;
  }
}
