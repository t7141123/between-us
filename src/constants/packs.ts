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
  {
    id: 'marriage',
    titleKey: 'pack_marriage_title',
    descKey: 'pack_marriage_desc',
    badgeKey: 'pack_marriage_badge',
    totalCount: 50,
    freeTrialCount: 3,
    priceText: 'NT$ 90',
  },
  {
    id: 'parenting',
    titleKey: 'pack_parenting_title',
    descKey: 'pack_parenting_desc',
    badgeKey: 'pack_parenting_badge',
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
  isDarkSkin: boolean;
  subTextColor: string;
}

export const CARD_SKINS: CardSkinConfig[] = [
  {
    id: 'classic',
    nameKey: 'skin_classic_name',
    descKey: 'skin_classic_desc',
    accentColor: '#C4704F',
    bgColor: '#FAF6F0',
    textColor: '#2C2523',
    borderColor: 'rgba(44, 37, 35, 0.12)',
    isPremium: false,
    isDarkSkin: false,
    subTextColor: '#78716C',
  },
  {
    id: 'noir_gold',
    nameKey: 'skin_noir_gold_name',
    descKey: 'skin_noir_gold_desc',
    accentColor: '#D4AF37',
    bgColor: '#141416',
    textColor: '#F4F4F5',
    borderColor: 'rgba(212, 175, 55, 0.45)',
    isPremium: true,
    isDarkSkin: true,
    subTextColor: 'rgba(244, 244, 245, 0.75)',
  },
  {
    id: 'rose_wine',
    nameKey: 'skin_rose_wine_name',
    descKey: 'skin_rose_wine_desc',
    accentColor: '#9F1239',
    bgColor: '#FDF2F4',
    textColor: '#4C0519',
    borderColor: 'rgba(159, 18, 57, 0.25)',
    isPremium: true,
    isDarkSkin: false,
    subTextColor: 'rgba(159, 18, 57, 0.75)',
  },
  {
    id: 'forest_sage',
    nameKey: 'skin_forest_sage_name',
    descKey: 'skin_forest_sage_desc',
    accentColor: '#34D399',
    bgColor: '#0A231C',
    textColor: '#ECFDF5',
    borderColor: 'rgba(52, 211, 153, 0.35)',
    isPremium: true,
    isDarkSkin: true,
    subTextColor: 'rgba(236, 253, 245, 0.75)',
  },
];

export const SENSUAL_PACK_DATA = require('../../scripts/questions-data/sensual.js') as {
  tw: string;
  cn: string;
  en: string;
}[];

export const MARRIAGE_PACK_DATA = require('../../scripts/questions-data/marriage.js') as {
  tw: string;
  cn: string;
  en: string;
}[];

export const PARENTING_PACK_DATA = require('../../scripts/questions-data/parenting.js') as {
  tw: string;
  cn: string;
  en: string;
}[];
