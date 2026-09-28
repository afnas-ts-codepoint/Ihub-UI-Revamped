export const HOME_PURCHASING_SECTIONS = [
  'create',
  'pending',
  'edit',
  'review',
  'po',
  'quotations',
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

/** @prototype index.html:L10144-L10149 `poRows`. */
export type PurchaseOrderRow = Readonly<{
  id: string;
  issued: string;
  ref: string;
  status: string;
  supplier: string;
  tone: PurchasingTone;
  value: string;
}>;

/** @prototype index.html:L10332-L10336 `poHistRows`. */
export type PurchaseOrderHistoryRow = Readonly<{
  action: string;
  by: string;
  date: string;
  id: string;
  note: string;
  tone: PurchasingTone;
}>;

/** @prototype index.html:L10389-L10390 `poAttach.files` entries. */
export type PoAttachmentFile = Readonly<{ caption: string; name: string }>;

/**
 * The recap fields seeded fresh on every row-action click
 * (`index.html:L10140`); `poNo`/`actual`/`remarks`/`files` are intentionally
 * excluded here because they live as `PoAttachDialog`'s own local state,
 * reset by remounting the dialog on every open (see `PurchaseOrderView`).
 * @prototype index.html:L10140 `setPoAttach({...})`
 */
export type PoAttachSeed = Readonly<{
  pcDept: string;
  pcRef: string;
  pcStatus: string;
  pcTitle: string;
  pcValue: string;
  po: string;
  supplier: string;
}>;

export type QuotationCurrency = 'AED' | 'EUR' | 'GBP' | 'KWD' | 'SAR' | 'USD';

export type SupplierQuotationRow = Readonly<{
  id: string;
  items: string;
  pcRef: string;
  status: string;
  supplier: string;
  tone: PurchasingTone;
  valid: string;
  value: string;
}>;

export type SupplierQuotationHistoryRow = Readonly<{
  action: string;
  by: string;
  date: string;
  id: string;
  note: string;
  tone: PurchasingTone;
}>;

export type QuotationSupplierDraft = Readonly<{
  amount: string;
  attachments: readonly PoAttachmentFile[];
  category: string;
  collapsed?: boolean;
  convertedAmount: string;
  convertedAmountEdited: boolean;
  currency: QuotationCurrency;
  description: string;
  name: string;
  remarks: string;
}>;

export type AddQuotationSeed = Readonly<{
  pcDept: string;
  pcRef: string;
  pcStatus: string;
  pcSubmitted: string;
  pcTitle: string;
  pcValue: string;
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
