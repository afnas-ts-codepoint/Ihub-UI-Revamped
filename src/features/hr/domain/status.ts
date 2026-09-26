import type { OvertimeStatus } from '../types/overtime.types';

export type OvertimeStatusKey = 'aboveBudget' | 'approved' | 'pending' | 'verified';

/** @prototype index.html:L8379-L8433 */
export const overtimeStatusKeys: Record<OvertimeStatus, OvertimeStatusKey> = {
  'Above budget': 'aboveBudget',
  Approved: 'approved',
  Pending: 'pending',
  Verified: 'verified',
};

export const overtimeStatusTones: Record<OvertimeStatus, 'bad' | 'ok' | 'warn'> = {
  'Above budget': 'bad',
  Approved: 'ok',
  Pending: 'warn',
  Verified: 'ok',
};
