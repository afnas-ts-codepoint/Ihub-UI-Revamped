export type DashboardDatum = Readonly<{
  color: string;
  label: string;
  value: number;
}>;

export const TASK_METRICS = [
  { icon: 'dashboard', label: 'Total tasks', sub: '52 open', tone: 'default', value: '124' },
  { icon: 'refresh', label: 'In progress', sub: '28 new', tone: 'accent', value: '45' },
  { icon: 'check', label: 'Completed', sub: '+12 this month', tone: 'ok', value: '72' },
  { icon: 'power', label: 'Requires action', sub: 'SLA at risk', tone: 'bad', value: '11' },
] as const;

export const SLA_PERFORMANCE = [
  { label: 'Response time', note: 'Within SLA', tone: 'ok', value: '2.4h' },
  { label: 'Resolution time', note: 'At risk', tone: 'warn', value: '18.6h' },
  { label: 'Closing time', note: 'On track', tone: 'info', value: '4.2h' },
  { label: 'Avg completion', note: 'All tasks', tone: 'default', value: '25.2h' },
] as const;

export const COMPLIANCE = [
  { label: 'Maintenance', pct: 78, tone: 'ok' },
  { label: 'Facilities', pct: 55, tone: 'warn' },
  { label: 'Safety', pct: 40, tone: 'bad' },
  { label: 'Operations', pct: 85, tone: 'ok' },
  { label: 'Housekeeping', pct: 71, tone: 'warn' },
] as const;

export const COMPLIANCE_STATS = [
  { label: 'In progress', tone: 'warn', value: '42' },
  { label: 'Within SLA', tone: 'ok', value: '28' },
  { label: 'SLA exceeded', tone: 'bad', value: '14' },
  { label: 'Compliance rate', tone: 'accent', value: '67%' },
] as const;

export const COMPLIANCE_TREND = [58, 61, 59, 64, 63, 68, 66, 70] as const;

export const TASK_SOURCES = [
  { color: '#6D74C5', label: 'Checklist', value: 42 },
  { color: 'var(--accent)', label: 'Incident', value: 32 },
  { color: 'var(--ok)', label: 'Observation', value: 22 },
  { color: 'var(--warn)', label: 'Generic', value: 12 },
] as const satisfies readonly DashboardDatum[];

export const TASK_DEPENDENCIES = [
  { color: '#8E4B9E', label: 'Group', value: 24 },
  { color: '#6D74C5', label: 'Finance', value: 18 },
  { color: 'var(--warn)', label: 'Project Control', value: 12 },
  { color: 'var(--ok)', label: 'HR', value: 6 },
  { color: '#B07FBF', label: 'Others', value: 31 },
] as const satisfies readonly DashboardDatum[];

export const TASKS_BY_DEPARTMENT = [
  { color: '#93358D', label: 'Finance', value: 42 },
  { color: '#3B2D59', label: 'Operations', value: 38 },
  { color: '#7670B3', label: 'Facility', value: 30 },
  { color: '#B282BA', label: 'Engineering', value: 28 },
  { color: '#DEB0D2', label: 'Safety', value: 22 },
  { color: '#93358D', label: 'Support', value: 17 },
  { color: '#7670B3', label: 'Guest services', value: 15 },
] as const satisfies readonly DashboardDatum[];

export const TASKS_BY_MATRIX_PARTNER = [
  { color: '#93358D', label: 'Security', value: 24 },
  { color: '#3B2D59', label: 'Cleaning', value: 20 },
  { color: '#7670B3', label: 'F&B', value: 20 },
  { color: '#B282BA', label: 'Operations', value: 19 },
  { color: '#DEB0D2', label: 'Maintenance', value: 12 },
] as const satisfies readonly DashboardDatum[];

export const IMPACTED_AREAS = [
  { color: '#93358D', label: 'Thrill Rides', value: 45 },
  { color: '#3B2D59', label: 'Water Park', value: 38 },
  { color: '#7670B3', label: 'Rooms & Facilities', value: 35 },
  { color: '#B282BA', label: 'Kids Attractions', value: 32 },
  { color: '#DEB0D2', label: 'Food & Beverage', value: 28 },
  { color: '#93358D', label: 'Ticket Counters', value: 25 },
  { color: '#3B2D59', label: 'Parking & Transport', value: 22 },
  { color: '#7670B3', label: 'Entertainment Venues', value: 18 },
  { color: '#B282BA', label: 'Guest Services', value: 15 },
] as const satisfies readonly DashboardDatum[];

export const IMPACTED_AREA_DETAILS = {
  'Entertainment Venues': ['18', '6', '1', '88%', '8h'],
  'Food & Beverage': ['28', '9', '5', '70%', '16h'],
  'Guest Services': ['15', '5', '2', '82%', '9h'],
  'Kids Attractions': ['32', '14', '2', '84%', '10h'],
  'Parking & Transport': ['22', '7', '3', '76%', '11h'],
  'Rooms & Facilities': ['35', '12', '3', '81%', '12h'],
  'Thrill Rides': ['45', '17', '6', '72%', '18h'],
  'Ticket Counters': ['25', '8', '1', '90%', '6h'],
  'Water Park': ['38', '15', '4', '78%', '14h'],
} as const;

export const CRITICAL_TASKS = [
  { id: 'JO-1042', meta: 'Thrill Rides · Project Control', severity: 'Critical', subject: 'Ride safety sensor fault — Thrill zone' },
  { id: 'JO-1031', meta: 'Aid Stations · HR', severity: 'High', subject: 'First-aid station restock — Zone 4' },
  { id: 'JO-1027', meta: 'Facilities · Finance', severity: 'Critical', subject: 'Water treatment pump offline — Water Park' },
  { id: 'JO-1019', meta: 'Safety · Group', severity: 'High', subject: 'Fire exit obstruction — Food Court' },
] as const;

export const WORKLOAD_DAYS = [
  ['7/13', 'Mon'], ['7/14', 'Tue'], ['7/15', 'Wed'], ['7/16', 'Thu'],
  ['7/17', 'Fri'], ['7/18', 'Sat'], ['7/19', 'Sun'],
] as const;

export const DEPARTMENT_WORKLOAD = [
  { dept: 'TX', loads: [8, 12, 25, 35, 28, 18, 10] },
  { dept: 'Finance', loads: [5, 15, 22, 19, 14, 12, 8] },
  { dept: 'F Operations', loads: [6, 13, 20, 25, 18, 11, 7] },
  { dept: 'IT', loads: [22, 32, 45, 50, 38, 27, 20] },
  { dept: 'HR', loads: [4, 9, 16, 14, 19, 11, 6] },
  { dept: 'Development', loads: [17, 24, 31, 28, 33, 26, 19] },
  { dept: 'Security', loads: [9, 14, 18, 21, 16, 12, 8] },
  { dept: 'P&L', loads: [3, 7, 12, 18, 15, 10, 5] },
  { dept: 'Technical', loads: [19, 26, 34, 29, 23, 17, 13] },
] as const;

export const EMPLOYEE_WORKLOAD = [
  { dept: 'A. Al-Harbi', loads: [6, 10, 18, 22, 15, 9, 5] },
  { dept: 'N. Farouk', loads: [9, 14, 20, 17, 12, 8, 6] },
  { dept: 'K. Ibrahim', loads: [12, 20, 28, 31, 24, 16, 11] },
  { dept: 'L. Haddad', loads: [4, 8, 13, 11, 16, 9, 5] },
  { dept: 'Y. Malik', loads: [15, 22, 30, 26, 29, 21, 14] },
  { dept: 'R. Nasser', loads: [7, 11, 15, 19, 13, 10, 6] },
  { dept: 'M. Otaibi', loads: [10, 16, 24, 20, 18, 13, 9] },
  { dept: 'S. Sabah', loads: [3, 6, 10, 14, 12, 8, 4] },
  { dept: 'T. Nasser', loads: [13, 19, 25, 23, 20, 15, 10] },
] as const;

export const WORKLOAD_LEGEND = [
  { color: '#4FA87E', label: 'Low' },
  { color: '#D9A441', label: 'Med' },
  { color: '#E07B39', label: 'High' },
  { color: '#D9534F', label: 'V.Hi' },
  { color: '#E0538A', label: 'Crit' },
] as const;

export const WORKLOAD_STATUSES = ['Open', 'In progress', 'Review', 'Done'] as const;
