import type { PettyCashDraft } from '../types/paymentSettlement.types';

/** @prototype index.html:L7679 / L7761 `fmtKwd` (a falsy value renders as 0.000) */
export function formatPettyCashKwd(value: number): string {
  return `KWD ${(value || 0).toLocaleString('en-US', { maximumFractionDigits: 3, minimumFractionDigits: 3 })}`;
}

/** @prototype index.html:L7680 / L7762 `parseFloat(r.amount) || 0` */
export function pettyCashAmount(draft: Pick<PettyCashDraft, 'amount'>): number {
  return Number.parseFloat(draft.amount) || 0;
}

/** @prototype index.html:L7680 / L7762 `total` */
export function pettyCashTotal(drafts: readonly Pick<PettyCashDraft, 'amount'>[]): number {
  return drafts.reduce((sum, draft) => sum + pettyCashAmount(draft), 0);
}
