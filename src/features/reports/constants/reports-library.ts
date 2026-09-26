import type {
  ReportLibraryGroup,
  ReportLibraryItem,
} from '../types/reports-library.types';
import { REPORT_LIBRARY_GROUPS } from '../types/reports-library.types';

/** @prototype index.html:L9614-L9686 — the approved M3.9 standalone catalogue has 18 entries. */
export const REPORT_LIBRARY_CATALOGUE = [
  { id: 'attendance-summary', label: 'Attendance Summary', group: 'HR' },
  { id: 'attendance-detail', label: 'Attendance Detailed', group: 'HR' },
  { id: 'leave-balance', label: 'Leave Balance', group: 'HR' },
  { id: 'overtime-summary', label: 'Overtime Summary', group: 'Workforce' },
  { id: 'overtime-detail', label: 'Overtime Detailed', group: 'Workforce' },
  { id: 'appraisal-summary', label: 'Appraisal Summary', group: 'Performance' },
  { id: 'budget-vs-actual', label: 'Budget vs Actual', group: 'Finance' },
  { id: 'budget-utilisation', label: 'Budget Utilisation', group: 'Finance' },
  { id: 'revenue-projection', label: 'Revenue Projection', group: 'Finance' },
  { id: 'pc-pending', label: 'Purchasing Pending', group: 'Finance' },
  { id: 'petty-cash', label: 'Petty Cash Movement', group: 'Finance' },
  { id: 'job-orders', label: 'Tasks', group: 'Operations' },
  { id: 'violations', label: 'Violations Register', group: 'Operations' },
  { id: 'incidents', label: 'Incident Log', group: 'Operations' },
  { id: 'checklists', label: 'Checklist Compliance', group: 'Quality' },
  { id: 'enquiries', label: 'Enquiries Register', group: 'Operations' },
  { id: 'observations', label: 'Observations Register', group: 'Operations' },
  { id: 'audit-trail', label: 'Audit Trail', group: 'System' },
] as const satisfies readonly ReportLibraryItem[];

export const reportsForLibraryGroup = (group: ReportLibraryGroup) =>
  REPORT_LIBRARY_CATALOGUE.filter((report) => report.group === group);

export const DEFAULT_REPORT_LIBRARY_GROUP = REPORT_LIBRARY_GROUPS[0];
export const DEFAULT_REPORT_LIBRARY_REPORT = REPORT_LIBRARY_CATALOGUE[0];
