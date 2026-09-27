export const HOME_PURCHASING_SECTIONS = [
  'create',
  'pending',
  'edit',
  'review',
  'todo',
  'missing',
  'history',
  'report',
] as const;

export type HomePurchasingSection = (typeof HOME_PURCHASING_SECTIONS)[number];

export type PurchasingTone = 'bad' | 'ok' | 'warn';

/** @prototype index.html:L10070-L10106 `rows` (PC requests). */
export type PurchaseRequestRow = Readonly<{
  dept: string;
  id: string;
  status: string;
  submitted: string;
  title: string;
  tone: PurchasingTone;
  value: string;
  vendor: string;
}>;

/** @prototype index.html:L10163-L10167 `reqMissRows`. */
export type MissingDocumentRow = Readonly<{
  days: string;
  id: string;
  missing: readonly string[];
  title: string;
  vendor: string;
}>;

/** @prototype index.html:L10175-L10179 `reqHistRows`. */
export type PurchaseHistoryRow = Readonly<{
  action: string;
  by: string;
  date: string;
  id: string;
  note: string;
  tone: PurchasingTone;
}>;

/** @prototype index.html:L10231-L10235 `revExtra`. */
export type ReviewExtra = Readonly<{
  activity: string;
  budgetValue: string;
  budgeted: string;
  docs: readonly string[];
  high: string;
  just: string;
  locType: string;
  location: string;
  low: string;
  quotes: number;
  remarks: string;
  subActivity: string;
  suppliers: readonly string[];
  year: string;
  zone: string;
}>;
