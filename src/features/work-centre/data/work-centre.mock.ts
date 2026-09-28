import type { WorkCentreRow } from '../types/work-centre.types';

/** @prototype ihub/index.html:L7333-L7380 */
export const WORK_CENTRE_FALLBACK_ROWS = [
  {
    date: 'Apr 28',
    id: 'ENQ-118',
    priority: 'High',
    priorityTone: 'bad',
    raised: 'L. Haddad',
    site: 'SAMA Mall',
    status: 'Open',
    statusTone: 'warn',
    title: 'Aircon noise on floor 3 — escalating after 8 PM',
  },
  {
    date: 'Apr 27',
    id: 'ENQ-117',
    priority: 'Med',
    priorityTone: 'warn',
    raised: 'M. Hassan',
    site: 'Riyadh Park',
    status: 'Assigned',
    statusTone: 'neutral',
    title: 'Lighting flicker — corridor B',
  },
  {
    date: 'Apr 27',
    id: 'ENQ-116',
    priority: 'Low',
    priorityTone: 'neutral',
    raised: 'O. Najjar',
    site: 'Tower Plaza',
    status: 'Resolved',
    statusTone: 'ok',
    title: 'Tenant access card request',
  },
  {
    date: 'Apr 26',
    id: 'ENQ-115',
    priority: 'Low',
    priorityTone: 'neutral',
    raised: 'K. Ibrahim',
    site: 'SAMA Mall',
    status: 'Resolved',
    statusTone: 'ok',
    title: 'Loading dock paint scuff repair',
  },
] as const satisfies readonly WorkCentreRow[];
