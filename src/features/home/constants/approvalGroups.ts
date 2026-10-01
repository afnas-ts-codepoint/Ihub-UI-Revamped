import type { ActionKind, ApprovalGroupId } from '../types/queue.types';

/** @prototype ihub/index.html:L10139-L10146 `ACTION_GROUP` (fallback `other`). */
export const ACTION_GROUP: Readonly<Record<ActionKind, ApprovalGroupId>> = {
  'action-sheet': 'action-sheet',
  budget: 'new-budget',
  'budget-release': 'transfer-funds',
  contract: 'purchase-committee',
  leave: 'other',
  overtime: 'other',
  'petty-cash': 'transfer-funds',
  purchase: 'purchase-committee',
};

/** @prototype ihub/index.html:L10147-L10154 `APPROVAL_GROUPS`; `other` has no chip. */
export const APPROVAL_GROUP_IDS = [
  'all',
  'action-sheet',
  'new-budget',
  'transfer-funds',
  'purchase-committee',
] as const;

export type ApprovalFilterId = (typeof APPROVAL_GROUP_IDS)[number];
