import type { ChecklistStatus } from '../types/checklist.types';

export type ChecklistStatusKey = 'approved' | 'awaiting';

export const checklistStatusKeys: Record<ChecklistStatus, ChecklistStatusKey> =
  {
    Approved: 'approved',
    Awaiting: 'awaiting',
  };

/** @prototype index.html:L8600-L8602, L8604-L8640 */
export const checklistStatusTones: Record<ChecklistStatus, 'ok' | 'warn'> = {
  Approved: 'ok',
  Awaiting: 'warn',
};
