import { HOME_PURCHASING_SECTIONS, type HomePurchasingSection } from '../types/purchasing.types';

export const isHomePurchasingSection = (value: string | undefined): value is HomePurchasingSection =>
  value != null && HOME_PURCHASING_SECTIONS.includes(value as HomePurchasingSection);

/** @prototype index.html:L10124 `React.useState('create')`. */
export const defaultHomePurchasingSection: HomePurchasingSection = 'create';
