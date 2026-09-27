import type { HomeBannerData } from '../types/home.types';

/** @prototype index.html:L12135-L12459 OCC banner datasets. */
export const homeBannerData = {
  actions: [
    { id: 'A1', title: 'Budget Release — Eid Activation, 360 Mall', owner: 'Sara Al-Qahtani', dept: 'Marketing', amount: 'KWD 42,000', priority: 'critical', dueState: 'overdue', due: 'Overdue 2 days' },
    { id: 'A2', title: 'Purchase Approval (PC) — Cinema Projector Units ×2', owner: 'Khaled Ibrahim', dept: 'Operations', amount: 'KWD 28,500', priority: 'high', dueState: 'today', due: 'Due today' },
    { id: 'A3', title: 'Action Sheet — Crowd Safety Plan, Summer Festival', owner: 'Operations Committee', dept: 'Operations', amount: '6 owners', priority: 'high', dueState: 'today', due: 'Due 4:00 PM' },
    { id: 'A4', title: 'Petty Cash — Al Kout Venue Float Top-up', owner: 'Rania Farouk', dept: 'Venue Ops', amount: 'KWD 850', priority: 'medium', dueState: 'soon', due: 'Due in 2 days' },
    { id: 'A5', title: 'Budget Approval — Q3 Capex, Arcade Refresh', owner: 'Yazan Malik', dept: 'Projects', amount: 'KWD 115,000', priority: 'high', dueState: 'soon', due: 'Due in 3 days' },
    { id: 'A6', title: 'Overtime — Weekend Inventory, Riyadh Park', owner: 'Khaled Ibrahim', dept: 'Operations', amount: '34 hrs', priority: 'medium', dueState: 'today', due: 'Due today' },
    { id: 'A7', title: 'Approval Request — Facility Cleaning Renewal', owner: 'Procurement', dept: 'Procurement', amount: 'KWD 100,000', priority: 'medium', dueState: 'soon', due: 'Due in 4 days' },
    { id: 'A8', title: 'Leave Request — 12 days, Finance', owner: 'Mohammed Al-Otaibi', dept: 'Finance', amount: '12 days', priority: 'low', dueState: 'later', due: 'Due in 6 days' },
    { id: 'A9', title: 'Action Sheet — Venue Reopening, Riyadh Park', owner: 'Facilities Committee', dept: 'Venue Ops', amount: '4 owners', priority: 'medium', dueState: 'soon', due: 'Due in 2 days' },
    { id: 'A10', title: 'New Budget Request — Q3 Digital Marketing', owner: 'Sara Al-Qahtani', dept: 'Marketing', amount: 'KWD 60,000', priority: 'medium', dueState: 'soon', due: 'Due in 3 days' },
  ],
  assignedSheets: [{ id: 'AS-318' }, { id: 'AS-312' }, { id: 'AS-307' }],
  incidents: [
    { id: 'INC-2041', title: 'POS network outage — 360 Mall', severity: 'critical', status: 'Investigating', sla: 'breached', progress: 0.4, pinned: true },
    { id: 'INC-2039', title: 'HVAC failure — SAMA Cinema', severity: 'high', status: 'Assigned', sla: 'at-risk', progress: 0.25, pinned: false },
    { id: 'INC-2037', title: 'Payment gateway latency', severity: 'high', status: 'Monitoring', sla: 'ok', progress: 0.7, pinned: false },
    { id: 'INC-2034', title: 'Access-control door fault — Avenues', severity: 'medium', status: 'Assigned', sla: 'ok', progress: 0.5, pinned: false },
    { id: 'INC-2030', title: 'Digital signage display down', severity: 'low', status: 'Monitoring', sla: 'ok', progress: 0.8, pinned: false },
  ],
  jobOrders: [
    { id: 'JO-7782', status: 'New', isNew: true },
    { id: 'JO-7781', status: 'New', isNew: true },
    { id: 'JO-7779', status: 'Assigned', isNew: false },
    { id: 'JO-7775', status: 'In progress', isNew: false },
    { id: 'JO-7770', status: 'Review', isNew: false },
    { id: 'JO-7768', status: 'New', isNew: true },
  ],
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
} as const satisfies HomeBannerData;
