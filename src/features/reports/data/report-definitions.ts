import type { ReportDefinition } from '../report.types';

/** Reachable M3.1 definitions only; excluded prototype keys are documented under D11. */
export const REPORT_DEFINITIONS = {
  overtime: {
    kind: 'budget',
    label: { en: 'Overtime', ar: 'العمل الإضافي' },
    columns: [
      'OT #',
      'Employee',
      'Department',
      'Date',
      'Hours',
      'Amount (KWD)',
      'Status',
    ],
    rows: [
      ['OT-2451', 'Khaled Ibrahim', 'Operations', '28 Jul 2026', '4.5', '180.000', 'Pending'],
      ['OT-2450', 'Layla Haddad', 'Marketing', '28 Jul 2026', '3.0', '142.500', 'Approved'],
      ['OT-2449', 'Mohammed Al-Otaibi', 'Finance', '27 Jul 2026', '6.0', '320.000', 'Pending'],
      ['OT-2448', 'Sara Al-Qahtani', 'Marketing', '27 Jul 2026', '2.5', '125.000', 'Above budget'],
      ['OT-2447', 'Yousef Al-Mutairi', 'IT & Systems', '26 Jul 2026', '5.0', '210.000', 'Approved'],
    ],
    totals: { label: 'Total hours / value', value: '21.0 hrs · KWD 977.500' },
  },
  appraisal: {
    kind: 'task',
    label: { en: 'Appraisal', ar: 'التقييم' },
    columns: ['Appraisal #', 'Employee', 'Department', 'Period', 'Score', 'Rating', 'Reviewer'],
    rows: [
      ['APR-2026-118', 'Sara Al-Qahtani', 'Marketing', 'Q2 2026', '4.6', 'Exceeds', 'A. Al-Rashid'],
      ['APR-2026-117', 'Khaled Ibrahim', 'Operations', 'Q2 2026', '4.1', 'Exceeds', 'A. Al-Rashid'],
      ['APR-2026-116', 'Layla Haddad', 'Marketing', 'Q2 2026', '3.8', 'Meets', 'A. Al-Rashid'],
      ['APR-2026-115', 'Mohammed Al-Otaibi', 'Finance', 'Q2 2026', '3.4', 'Meets', 'N. Saleh'],
    ],
    totals: { label: 'Average score', value: '3.98 / 5.00' },
  },
  checklist: {
    kind: 'sheet',
    label: { en: 'SOP Checklists', ar: 'قوائم المراجعة' },
    columns: ['Checklist #', 'Title', 'Site', 'Submitted by', 'Date', 'Completion', 'Status'],
    rows: [
      ['CHK-2026-902', 'Pre-opening safety walk', 'The Avenues', 'M. Faris', '28 Jul 2026', '100%', 'Signed off'],
      ['CHK-2026-899', 'Ride daily inspection', 'Al Kout', 'O. Najjar', '28 Jul 2026', '92%', 'Open items'],
      ['CHK-2026-894', 'Hygiene audit — F&B', '360 Mall', 'R. Salem', '27 Jul 2026', '100%', 'Signed off'],
    ],
    totals: { label: 'Average completion', value: '97.3%' },
  },
  workflows: {
    kind: 'task',
    label: { en: 'Workflows', ar: 'مسارات العمل' },
    columns: ['Workflow', 'Owner', 'Steps', 'Avg. cycle', 'In flight', 'Breaches', 'Status'],
    rows: [
      ['Incident → Task', 'Operations', '5', '1.8 days', '12', '1', 'Active'],
      ['PC Request → PO', 'Procurement', '7', '6.4 days', '9', '2', 'Active'],
      ['Budget approval', 'Finance', '4', '3.1 days', '5', '0', 'Active'],
    ],
    totals: { label: 'Average cycle time', value: '3.8 days' },
  },
  budgeting: {
    kind: 'budget',
    label: { en: 'Budgeting', ar: 'الميزانية' },
    columns: ['Budget #', 'Line', 'Department', 'Type', 'Allocated (KWD)', 'Spent (KWD)', 'Variance'],
    rows: [
      ['BUD-2026-014', 'Ride maintenance', 'Maintenance', 'Opex', '32,000.000', '27,140.000', '-4,860.000'],
      ['BUD-2026-011', 'Summer campaign', 'Marketing', 'Marketing', '18,000.000', '19,420.000', '+1,420.000'],
      ['BUD-2026-007', 'Arena refurbishment', 'Facilities', 'Capex', '96,000.000', '61,300.000', '-34,700.000'],
    ],
    totals: { label: 'Net variance', value: '-KWD 38,140.000' },
  },
  notifications: {
    kind: 'history',
    label: { en: 'Notifications', ar: 'الإشعارات' },
    columns: ['Ref', 'Channel', 'Subject', 'Recipient', 'Sent', 'Read', 'Status'],
    rows: [
      ['NTF-90412', 'In-app', 'Incident INC-2041 escalated', 'Operations', '27 Jul 2026 14:02', 'Yes', 'Delivered'],
      ['NTF-90408', 'Email', 'PC-2026-088 awaiting CEO', 'CEO Office', '24 Jul 2026 09:15', 'No', 'Delivered'],
      ['NTF-90401', 'SMS', 'Shift cover confirmed', 'K. Ibrahim', '23 Jul 2026 18:40', 'Yes', 'Delivered'],
    ],
    totals: { label: 'Read rate', value: '67%' },
  },
  history: {
    kind: 'history',
    label: { en: 'History', ar: 'السجل' },
    columns: ['Ref', 'Record', 'Action', 'User', 'Department', 'Date', 'Note'],
    rows: [
      ['REC-2026318', 'TSK-2026-318', 'Edited', 'M. Faris', 'Operations', '27 Jul 2026', 'Stage moved to Ongoing'],
      ['REC-2026311', 'PC-2026-088', 'Submitted', 'S. Al-Qahtani', 'IT & Systems', '24 Jul 2026', 'Sent to committee'],
      ['REC-2026304', 'BUD-2026-011', 'Approved', 'CEO Office', 'Finance', '21 Jul 2026', 'Additional budget released'],
    ],
    totals: { label: 'Entries in range', value: '3 of 1,482' },
  },
} as const satisfies Record<string, ReportDefinition>;

export type ReportKey = keyof typeof REPORT_DEFINITIONS;

export const UNREACHABLE_REPORT_KEYS = [
  'joborders',
  'observations',
  'processes',
  'purchasing',
  'pettycash',
  'approve',
] as const;

export function reportDefinitionFor(
  key: string | undefined,
): ReportDefinition | undefined {
  const root = key?.split('/')[0] ?? '';
  return root in REPORT_DEFINITIONS
    ? REPORT_DEFINITIONS[root as ReportKey]
    : undefined;
}
