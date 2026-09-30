export const HOME_PAYMENT_SETTLEMENT_MODULES = [
  'action-sheet',
  'petty-cash',
  'add-supplier',
] as const;

export type HomePaymentSettlementModule = (typeof HOME_PAYMENT_SETTLEMENT_MODULES)[number];

export type ActionSheetTone = 'bad' | 'ok' | 'warn';

/** @prototype index.html:L17189-L17193 `editRows` */
export type ActionSheetEditRow = Readonly<{
  dept: string;
  id: string;
  status: string;
  title: string;
  tone: ActionSheetTone;
  type: string;
  value: string;
}>;

/** @prototype index.html:L17203-L17207 `missRows` */
export type ActionSheetMissingRow = Readonly<{
  days: string;
  id: string;
  missing: readonly string[];
  supplier: string;
  title: string;
}>;

/** @prototype index.html:L17218-L17222 `prepayRows` */
export type ActionSheetPrepayRow = Readonly<{
  advance: string;
  ccy: string;
  date: string;
  id: string;
  status: string;
  supplier: string;
  tone: ActionSheetTone;
}>;

/** @prototype index.html:L17233-L17237 `costRows` */
export type ActionSheetCostRow = Readonly<{
  id: string;
  line: string;
  recorded: string;
  status: string;
  title: string;
  tone: ActionSheetTone;
  variance: string;
  vTone: ActionSheetTone | '';
}>;

/** @prototype index.html:L17247-L17252 `histRows` */
export type ActionSheetHistoryRow = Readonly<{
  action: string;
  by: string;
  date: string;
  id: string;
  kind: 'purchase' | 'service';
  note: string;
  tone: ActionSheetTone | '';
}>;

export type ActionSheetCurrency = 'AED' | 'EUR' | 'GBP' | 'KWD' | 'SAR' | 'USD';

/** @prototype index.html:L17050 `mk()` */
export type ActionSheetAttachment = Readonly<{ caption: string; name: string }>;

export type ActionSheetDraft = {
  activity: string;
  budgeted: 'no' | 'yes';
  category: string;
  ccy: ActionSheetCurrency | '';
  collapsed: boolean;
  dept: string;
  files: ActionSheetAttachment[];
  grn: boolean;
  invoice: string;
  key: string;
  location: string;
  payType: 'advance' | 'final';
  pval: string;
  remarks: string;
  sheetType: 'regular' | 'scheduled';
  subActivity: string;
  supplier: string;
  year: string;
  zone: string;
};
