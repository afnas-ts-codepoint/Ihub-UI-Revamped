import type { ActionSheetCurrency, ActionSheetDraft } from '../types/paymentSettlement.types';

/**
 * Static local rate table, deliberately distinct from Purchasing's own
 * `CBK_RATES_KWD` (`EUR` 0.334 vs 0.335, `SAR` 0.0819 vs 0.082, `GBP` 0.392
 * vs 0.39) — the prototype hardcodes a separate, slightly different table
 * per screen and this is not reconciled.
 * @prototype index.html:L17062 `FX`
 */
export const ACTION_SHEET_FX = {
  AED: 0.0836,
  EUR: 0.335,
  GBP: 0.39,
  KWD: 1,
  SAR: 0.082,
  USD: 0.307,
} as const satisfies Readonly<Record<ActionSheetCurrency, number>>;

export const ACTION_SHEET_CURRENCIES = Object.keys(ACTION_SHEET_FX) as ActionSheetCurrency[];

/** @prototype index.html:L17063 `fmtKwd` */
export function formatActionSheetKwd(value: number): string {
  return `KWD ${value.toLocaleString('en-US', { maximumFractionDigits: 3, minimumFractionDigits: 3 })}`;
}

/** @prototype index.html:L17064 `purchaseOf` */
export function actionSheetPurchaseValue(draft: ActionSheetDraft): number {
  if (!draft.ccy) return 0;
  const parsed = Number.parseFloat(draft.pval);
  return Number.isFinite(parsed) ? parsed * ACTION_SHEET_FX[draft.ccy] : 0;
}

/** @prototype index.html:L17065 `aboveOf` */
export function actionSheetAboveBudget(draft: ActionSheetDraft): number {
  return draft.budgeted === 'no' ? actionSheetPurchaseValue(draft) : 0;
}
