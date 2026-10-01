import type { QueueAction } from '../types/queue.types';

const PREFIX: Readonly<Record<string, string>> = {
  'action-sheet': 'AS',
  'additional-budget': 'BUD',
  'advance-payment': 'ADV',
  budget: 'BUD',
  'budget-release': 'BUD',
  'payment-settlement': 'PS',
  'petty-cash': 'PCV',
  purchase: 'PC',
  'purchase-committee': 'PC',
  request: 'REQ',
  'transfer-funds': 'TRF',
};

/**
 * Display reference such as `BUD-2026-107`. The suffix is the last three
 * characters of `100 + n × 7` (so it wraps for n ≥ 129, as in the prototype).
 * @prototype ihub/index.html:L10864-L10865 `ASG_PREFIX`, `asgCode`
 */
export function referenceCode(action: Pick<QueueAction, 'group' | 'id' | 'kind'>) {
  const prefix = PREFIX[action.kind] ?? PREFIX[action.group] ?? 'REQ';
  const digits = parseInt(action.id.replace(/\D/g, ''), 10) || 0;
  return `${prefix}-2026-${String(100 + digits * 7).slice(-3)}`;
}
