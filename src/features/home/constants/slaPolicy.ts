/** @prototype ihub/index.html:L10286-L10288 SLA policy tables. */
export const SLA_TARGET_H: Readonly<Record<string, number>> = {
  'action-sheet': 8,
  budget: 72,
  'budget-release': 24,
  contract: 120,
  leave: 48,
  overtime: 24,
  'petty-cash': 72,
  purchase: 48,
};

export const SLA_FRACTION: Readonly<Record<string, number>> = {
  later: 0.22,
  overdue: 1.22,
  soon: 0.55,
  today: 0.88,
};

export const SLA_OVERRIDE: Readonly<Record<string, number>> = {
  A3: 0.97,
  A9: 0.34,
  'JO-7768': 1.14,
  'JO-7770': 0.31,
};

/** Job-order target hours by priority (`slaOf`, `isJO` branch). */
export const JOB_ORDER_TARGET_H: Readonly<Record<string, number>> = {
  critical: 8,
  high: 24,
  medium: 48,
};
export const JOB_ORDER_DEFAULT_TARGET_H = 96;
export const DEFAULT_TARGET_H = 24;
export const DEFAULT_FRACTION = 0.4;
