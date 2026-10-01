import type { HomeBannerData } from '../types/home.types';
import { ACTIONS } from './actions.mock';
import { INCIDENTS } from './incidents.mock';
import { JOB_ORDERS } from './jobOrders.mock';

/**
 * Banner seed. `actions`, `incidents` and `jobOrders` are the same fixtures the
 * queue store owns; `useHomeBannerData` swaps them for live store slices.
 * @prototype index.html:L12135-L12459 OCC banner datasets.
 */
export const homeBannerData = {
  actions: ACTIONS,
  assignedSheets: [{ id: 'AS-318' }, { id: 'AS-312' }, { id: 'AS-307' }],
  incidents: INCIDENTS,
  jobOrders: JOB_ORDERS,
  profile: {
    completion: 0.82,
    delegates: [
      { name: 'Antony Linto', title: 'General Manager - Development & Maintenance' },
      { name: 'Ahmed Fathi Ali Mahmoud', title: 'Dept. Coordinator' },
    ],
    delegationTill: '30 Sep 2026',
    name: 'Ahmad Al Osaimi',
    role: 'Chairman & CEO',
  },
} satisfies HomeBannerData;
