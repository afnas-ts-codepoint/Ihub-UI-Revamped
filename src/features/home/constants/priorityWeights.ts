import type { HomeDueState, HomePriority } from '../types/home.types';

/** @prototype ihub/index.html:L10310-L10311 `PRIORITY_WEIGHT` */
export const PRIORITY_WEIGHT: Readonly<Record<HomePriority, number>> = {
  critical: 100,
  high: 70,
  low: 15,
  medium: 40,
};

/** @prototype ihub/index.html:L10312 `DUE_WEIGHT` */
export const DUE_WEIGHT: Readonly<Record<HomeDueState, number>> = {
  later: 0,
  overdue: 60,
  soon: 15,
  today: 35,
};
