/**
 * Task View (M8.4) static fixture data.
 *
 * This surface's attachments/subtasks/dependencies/history/Gantt content is
 * module-level static fixture data in the prototype too — generic, not derived
 * per task id — so it is ported here verbatim as feature-local fixtures, the
 * same way `tasks.mock.ts` holds `TASKS`/`TASK_CHECKLIST`. Row/label content
 * stays literal English, matching the established fixture-data convention
 * (see `purchasing.mock.ts`); only UI chrome routes through i18n.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L16515-L16521 (`JO_TEAM`), L18152-L18160
 * (`EDIT_SUBTASKS`), L18629-L18630 (`currentDeps`), L18310-L18312 (`slaHistory`),
 * L18032 (attachment fixture), L18976-L18981 (`SUBTASK_HISTORY`),
 * L18773-L18776 (`logNotes`), L19006-L19046 (Gantt column/row-bar lookups).
 */

/** Matches `CreateTaskPage.tsx`'s local `team` roster (same prototype `JO_TEAM`). */
export const TASK_VIEW_TEAM = [
  'Tom Baker',
  'Sarah Johnson',
  'Mike Chen',
  'Emily Davis',
  'Ahmed Ali',
] as const;

export type SubtaskStatus = 'done' | 'pending' | 'progress';

export type SubtaskProgressRow = Readonly<{
  assignee: string;
  category: string;
  department: string;
  due: string;
  endLabel: string;
  percent: number;
  role: string;
  slaOk: boolean;
  startLabel: string;
  status: SubtaskStatus;
  subDepartment: string;
  title: string;
}>;

/** @prototype ihub/ORIGINAL_SOURCE.html:L18152-L18160 `EDIT_SUBTASKS` (7 rows). */
export const SUBTASK_PROGRESS_ROWS: readonly SubtaskProgressRow[] = [
  { assignee: 'Tom Baker', category: 'Safety & Compliance', department: 'Operations', due: 'Feb 5, 10:00 AM', endLabel: 'Feb 5', percent: 100, role: 'Operations Manager', slaOk: true, startLabel: 'Feb 5', status: 'done', subDepartment: 'Ride Operations', title: 'Identify Safety Issue' },
  { assignee: 'Sarah Johnson', category: 'Procurement Project', department: 'Operations', due: 'Feb 5, 02:00 PM', endLabel: 'Feb 5', percent: 100, role: 'Inventory Manager', slaOk: true, startLabel: 'Feb 5', status: 'done', subDepartment: 'Supply Chain', title: 'Check Vendor Stock' },
  { assignee: 'Mike Chen', category: 'Procurement Project', department: 'Operations', due: 'Feb 6, 04:30 PM', endLabel: 'Feb 6', percent: 100, role: 'Procurement Officer', slaOk: true, startLabel: 'Feb 6', status: 'done', subDepartment: 'Supply Chain', title: 'Procure & Deliver Parts' },
  { assignee: 'Emily Davis', category: 'Preventive Maintenance', department: 'Maintenance', due: 'Feb 7, 08:30 AM', endLabel: 'Feb 8', percent: 45, role: 'HVAC Specialist', slaOk: true, startLabel: 'Feb 7', status: 'progress', subDepartment: 'HVAC', title: 'Equipment Setup' },
  { assignee: 'Ahmed Ali', category: 'Preventive Maintenance', department: 'Maintenance', due: 'Feb 8, 11:00 AM', endLabel: 'Feb 9', percent: 20, role: 'Electrician', slaOk: false, startLabel: 'Feb 8', status: 'pending', subDepartment: 'Electrical', title: 'Electrical Inspection' },
  { assignee: 'Tom Baker', category: 'Safety & Compliance', department: 'QA & Compliance', due: 'Feb 9, 09:00 AM', endLabel: 'Feb 9', percent: 30, role: 'Safety Officer', slaOk: true, startLabel: 'Feb 9', status: 'pending', subDepartment: 'Audits', title: 'Safety Walkthrough' },
  { assignee: 'Sarah Johnson', category: 'Procurement Project', department: 'Finance', due: 'Feb 6, 12:00 PM', endLabel: 'Feb 7', percent: 60, role: 'Finance Analyst', slaOk: true, startLabel: 'Feb 6', status: 'progress', subDepartment: 'Budgeting', title: 'Budget Approval' },
] as const;

export type SubtaskHistoryStatusKey = 'assigned' | 'completed' | 'inProgress';

export type SubtaskHistoryRow = Readonly<{
  assignee: string;
  department: string;
  percent: number;
  project: string;
  status: string;
  statusKey: SubtaskHistoryStatusKey;
  subDepartment: string;
  title: string;
}>;

/** @prototype ihub/ORIGINAL_SOURCE.html:L18976-L18981 `SUBTASK_HISTORY` (4 rows). */
export const SUBTASK_HISTORY_ROWS: readonly SubtaskHistoryRow[] = [
  { assignee: 'Tom Baker', department: 'Electrical Systems', percent: 10, project: 'Maintenance Project', status: 'Completed', statusKey: 'completed', subDepartment: 'Electrical Systems', title: 'Initial Assessment' },
  { assignee: 'Sarah Johnson', department: 'Logistics', percent: 15, project: 'Procurement Project', status: 'Completed', statusKey: 'completed', subDepartment: 'Supply Chain', title: 'Parts Procurement' },
  { assignee: 'Mike Chen', department: 'Operations', percent: 20, project: 'Safety & Compliance', status: 'In Progress', statusKey: 'inProgress', subDepartment: 'Ride Operations', title: 'Equipment Setup' },
  { assignee: 'Emily Davis', department: 'Electrical Systems', percent: 30, project: 'Maintenance Project', status: 'Assigned', statusKey: 'assigned', subDepartment: 'Electrical Systems', title: 'Installation Work' },
] as const;

export type SubtaskTimelineEntryType = 'assigned' | 'completed' | 'created' | 'updated';

export type SubtaskTimelineEntry = Readonly<{
  by: string;
  desc: string;
  title: string;
  type: SubtaskTimelineEntryType;
  when: string;
}>;

/**
 * Every entry shares one hardcoded timestamp in the prototype — not varied
 * per event — ported verbatim as a `PROTOTYPE-NOOP`.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18989-L19005 `buildSubTaskTimeline`.
 */
export function buildSubtaskTimeline(row: SubtaskHistoryRow, index: number): readonly SubtaskTimelineEntry[] {
  const stepPercent = Math.min(95, 15 + index * 12);
  const entries: SubtaskTimelineEntry[] = [
    {
      by: 'System Admin',
      desc: `Task created and assigned to ${row.assignee}`,
      title: 'Sub-task created',
      type: 'created',
      when: '02 May 2026, 09:00',
    },
  ];
  // Every SUBTASK_HISTORY_ROWS row is already at least "assigned" (the type has
  // no earlier state), so this entry is unconditional, matching the prototype's
  // own always-true first branch for this fixture.
  entries.push({
    by: 'Manager',
    desc: `Senior Technician - ${row.department}`,
    title: `Assigned to ${row.assignee}`,
    type: 'assigned',
    when: '02 May 2026, 09:00',
  });
  if (row.statusKey === 'inProgress' || row.statusKey === 'completed') {
    entries.push(
      {
        by: row.assignee,
        desc: 'Started initial site inspection',
        title: 'Status updated to In Progress',
        type: 'updated',
        when: '02 May 2026, 09:00',
      },
      {
        by: row.assignee,
        desc: `Completed equipment diagnostics - ${String(stepPercent)}% complete`,
        title: 'Progress update',
        type: 'updated',
        when: '02 May 2026, 09:00',
      },
    );
  }
  if (row.statusKey === 'completed') {
    entries.push({
      by: row.assignee,
      desc: 'Assessment report submitted and approved',
      title: 'Sub-task completed',
      type: 'completed',
      when: '02 May 2026, 09:00',
    });
  }
  return entries;
}

export type AttachmentFixture = Readonly<{
  by: string;
  name: string;
  size: string;
  when: string;
}>;

/** @prototype ihub/ORIGINAL_SOURCE.html:L18032 — single fixture, no real File/Blob. */
export const TASK_VIEW_ATTACHMENTS: readonly AttachmentFixture[] = [
  { by: 'Current User', name: 'Screenshot (7).png', size: '512 KB', when: '09 Mar 2027, 14:32' },
] as const;

export type DependencyRow = Readonly<{
  blocking: boolean;
  category: string;
  id: string;
  leadTime: string;
  remarks: string;
  status: string;
  type: string;
  /** Working days from "now" — computed at render time, matching the prototype. */
  workdaysFromNow: number;
}>;

/**
 * @prototype ihub/ORIGINAL_SOURCE.html:L18629-L18630 `currentDeps` — the single
 * seeded dependency's impact date is `depAddWorkdays(new Date(), 3)`, i.e. 3
 * working days from render time. Kept as a working-days offset here so it is
 * computed the same way at render time rather than frozen at module load.
 */
export const TASK_VIEW_DEPENDENCIES: readonly DependencyRow[] = [
  {
    blocking: true,
    category: 'Contractor, Third-party Service',
    id: 'DEP-001',
    leadTime: '2-3 business days',
    remarks: 'Safety sensors acquired and delivered - ready for installation',
    status: 'Pending',
    type: 'External Vendors',
    workdaysFromNow: 3,
  },
] as const;

export type SlaHistoryEntry = Readonly<{
  from: string;
  reason: string;
  to: string;
  when: string;
  who: string;
}>;

/** @prototype ihub/ORIGINAL_SOURCE.html:L18310-L18312 `slaHistory` (1 entry). */
export const TASK_VIEW_SLA_HISTORY: readonly SlaHistoryEntry[] = [
  {
    from: '2026-02-02T18:00',
    reason: 'Vendor delivery delay - spare parts ETA extended',
    to: '2026-02-03T12:00',
    when: '2026-02-02 10:30 AM',
    who: 'Alex Morgan',
  },
] as const;
export const TASK_VIEW_SLA_TARGET = '2026-02-03T12:00';

export type ActivityFile = Readonly<{ name: string; size: string }>;

export type ActivityRow = Readonly<{
  action: string;
  comment: string;
  department: string;
  files: readonly ActivityFile[];
  id: number;
  isCeo: boolean;
  partnerStatus: string;
  remarks: string;
  user: string;
  when: string;
}>;

/** @prototype ihub/ORIGINAL_SOURCE.html:L18491 `TDP_FILE_POOL`. */
const ACTIVITY_FILE_POOL: readonly ActivityFile[] = [
  { name: 'Inspection_report.pdf', size: '248 KB' },
  { name: 'Vendor_quote.pdf', size: '112 KB' },
  { name: 'Parts_invoice.pdf', size: '86 KB' },
  { name: 'Sign-off_sheet.pdf', size: '64 KB' },
  { name: 'Safety_checklist.pdf', size: '140 KB' },
];

/** @prototype ihub/ORIGINAL_SOURCE.html:L18492 `tdpFilesFor`. */
function activityFilesFor(index: number): readonly ActivityFile[] {
  if (index === 1) return [ACTIVITY_FILE_POOL[4] as ActivityFile];
  if (index % 3 === 0) {
    const start = index % 5;
    const length = index % 2 === 0 ? 2 : 1;
    return ACTIVITY_FILE_POOL.slice(start, start + length);
  }
  return [];
}

/** @prototype ihub/ORIGINAL_SOURCE.html:L17265-L17276 `TDP_ACTIVITY_TPL` (10 rows). */
const ACTIVITY_TEMPLATE: readonly Readonly<{ action: string; comment: string }>[] = [
  { action: 'Comment Added', comment: 'Zone A work complete. Moving to next zone. All old parts disposed properly.' },
  { action: 'Comment Added', comment: 'Commenced work. All materials collected from stock. Starting with zone A.' },
  { action: 'Comment Added', comment: 'Assigned to {assignee} - specialist. Estimated duration: 2 hours.' },
  { action: 'Status Updated', comment: 'Moved to In Progress after supervisor sign-off.' },
  { action: 'Comment Added', comment: 'Parts on order confirmed with vendor; ETA within SLA window.' },
  { action: 'Status Updated', comment: 'Escalated for review due to dependency on {dept}.' },
  { action: 'Comment Added', comment: 'Site inspection complete; no further blockers found.' },
  { action: 'Comment Added', comment: 'Checklist item verified and closed out.' },
  { action: 'Status Updated', comment: 'Task reassigned within {dept}.' },
  { action: 'Comment Added', comment: 'Task created from {source} record.' },
] as const;

const CEO_NAME = 'Yousef Al-Kandari';

/** @prototype ihub/ORIGINAL_SOURCE.html:L18505-L18516 `activity` (minus the
 * conditional target-date-change row, which has no real target-date edit to
 * mirror in read-only Task View and was intentionally not ported). */
export function buildActivityRows(seed: number, department: string): readonly ActivityRow[] {
  return ACTIVITY_TEMPLATE.map((entry, index) => {
    const isCeo = index === 1 || index === 4;
    return {
      action: entry.action,
      comment: entry.comment
        .replace('{assignee}', 'Unassigned')
        .replace('{dept}', department)
        .replace('{source}', 'Generic'),
      department: isCeo ? 'Executive Office' : department,
      files: activityFilesFor(index),
      id: index,
      isCeo,
      partnerStatus: index < 3 ? 'In Progress' : index < 7 ? 'Assigned' : 'New',
      remarks: `Zone ${index % 2 === 0 ? 'A' : 'B'} complete - ${String(Math.min(95, 15 + index * 12))}% done`,
      user: isCeo ? CEO_NAME : TASK_VIEW_TEAM[(seed + index) % TASK_VIEW_TEAM.length] ?? TASK_VIEW_TEAM[0],
      when: `0${String(2 + (index % 8))} Oct 26 10:00`,
    };
  });
}

export type LogNoteEntry = Readonly<{ text: string; when: string; who: string }>;

/** @prototype ihub/ORIGINAL_SOURCE.html:L18773-L18776 `logNotes` (seeded, 2 entries). */
export const TASK_VIEW_LOG_NOTES: readonly LogNoteEntry[] = [
  { text: 'Hey @Mike Johnson, can you review the electrical panel specs before we proceed?', when: '10:30 AM', who: 'Sarah Chen' },
  { text: '@Sarah Chen Sure! I checked the specs - everything looks good. Voltage ratings are within acceptable range. We can move forward.', when: '10:45 AM', who: 'Mike Johnson' },
] as const;

export type GanttViewOption = 'Day' | 'Month' | 'Week';

export type GanttColumnFixture = Readonly<{ primary: string; secondary: string }>;

/** @prototype ihub/ORIGINAL_SOURCE.html:L19006-L19038 `GANTT_DAYS`/`GANTT_WEEKS`/`GANTT_MONTHS`. */
export const GANTT_COLUMNS_BY_VIEW: Readonly<Record<GanttViewOption, readonly GanttColumnFixture[]>> = {
  Day: [
    { primary: 'Feb 5', secondary: 'Day 1' },
    { primary: 'Feb 6', secondary: 'Day 2' },
    { primary: 'Feb 7', secondary: 'Day 3' },
    { primary: 'Feb 8', secondary: 'Day 4' },
    { primary: 'Feb 9', secondary: 'Day 5' },
    { primary: 'Feb 10', secondary: 'Day 6' },
    { primary: 'Feb 11', secondary: 'Day 7' },
  ],
  Month: [
    { primary: 'Feb', secondary: '2026' },
    { primary: 'Mar', secondary: '2026' },
    { primary: 'Apr', secondary: '2026' },
    { primary: 'May', secondary: '2026' },
    { primary: 'Jun', secondary: '2026' },
    { primary: 'Jul', secondary: '2026' },
    { primary: 'Aug', secondary: '2026' },
    { primary: 'Sep', secondary: '2026' },
    { primary: 'Oct', secondary: '2026' },
    { primary: 'Nov', secondary: '2026' },
    { primary: 'Dec', secondary: '2026' },
    { primary: 'Jan', secondary: '2027' },
  ],
  Week: [
    { primary: 'Week 1', secondary: 'Feb 5 – 11' },
    { primary: 'Week 2', secondary: 'Feb 12 – 18' },
    { primary: 'Week 3', secondary: 'Feb 19 – 25' },
    { primary: 'Week 4', secondary: 'Feb 26 – Mar 4' },
    { primary: 'Week 5', secondary: 'Mar 5 – 11' },
    { primary: 'Week 6', secondary: 'Mar 12 – 18' },
    { primary: 'Week 7', secondary: 'Mar 19 – 25' },
    { primary: 'Week 8', secondary: 'Mar 26 – Apr 1' },
  ],
};

/**
 * Decorative, fixed 4-entry cycling bar lookup applied by row index —
 * `PROTOTYPE-NOOP`, never derived from real dates.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L19041-L19046 `GANTT_ROW_META`.
 */
export const GANTT_ROW_META: readonly Readonly<{ span: number; start: number; tone: string }>[] = [
  { span: 2, start: 0, tone: 'var(--warn)' },
  { span: 2, start: 1, tone: 'var(--info)' },
  { span: 3, start: 2, tone: 'var(--ok)' },
  { span: 1, start: 3, tone: 'var(--bad)' },
];
