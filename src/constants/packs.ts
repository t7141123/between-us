/**
 * Expansion packs and card skins definitions.
 */
import { CardSkinId, ExpansionPack } from '../types';

export const EXPANSION_PACKS: ExpansionPack[] = [
  {
    id: 'sensual',
    titleKey: 'pack_sensual_title',
    descKey: 'pack_sensual_desc',
    badgeKey: 'pack_sensual_badge',
    totalCount: 50,
    freeTrialCount: 3,
    priceText: 'NT$ 90',
  },
];

export interface CardSkinConfig {
  id: CardSkinId;
  nameKey: string;
  descKey: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  isPremium: boolean;
}

export const CARD_SKINS: CardSkinConfig[] = [
  {
    id: 'classic',
    nameKey: 'skin_classic_name',
    descKey: 'skin_classic_desc',
    accentColor: '#C4704F',
    bgColor: '#FAF6F0',
    textColor: '#2C2523',
    borderColor: 'rgba(44, 37, 35, 0.1)',
    isPremium: false,
  },
  {
    id: 'noir_gold',
    nameKey: 'skin_noir_gold_name',
    descKey: 'skin_noir_gold_desc',
    accentColor: '#D4AF37',
    bgColor: '#18181B',
    textColor: '#F4F4F5',
    borderColor: 'rgba(212, 175, 55, 0.4)',
    isPremium: true,
  },
  {
    id: 'midnight',
    nameKey: 'skin_midnight_name',
    descKey: 'skin_midnight_desc',
    accentColor: '#818CF8',
    bgColor: '#0F172A',
    textColor: '#E2E8F0',
    borderColor: 'rgba(129, 140, 248, 0.3)',
    isPremium: true,
  },
  {
    id: 'caramel',
    nameKey: 'skin_caramel_name',
    descKey: 'skin_caramel_desc',
    accentColor: '#B45309',
    bgColor: '#FEF3C7',
    textColor: '#451A03',
    borderColor: 'rgba(180, 83, 9, 0.25)',
    isPremium: true,
  },
];

export const SENSUAL_PACK_DATA = require('../../scripts/questions-data/sensual.js') as {
  tw: string;
  cn: string;
  en: string;
}[];
