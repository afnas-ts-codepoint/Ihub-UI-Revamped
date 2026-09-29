import { TASK_DASHBOARD_MANDATORY_IDS, TASK_DASHBOARD_WIDGETS } from './taskDashboardWidgets.data';
import type { AdminDashboardDefinition, DashboardId, DashboardWidget } from '../types/dashboardConfig.types';

/** @prototype index.html:L7038-L7052 */
const HOME_WIDGETS: readonly DashboardWidget[] = [
  { cat: 'Metrics', desc: { ar: 'أولويات اليوم', en: 'Today’s priorities and headlines' }, icon: 'sparkle', id: 'brief', label: { ar: 'الملخص اليومي', en: 'Daily brief' }, size: 'full' },
  { cat: 'Metrics', desc: { ar: 'الأرقام عبر الوحدات', en: 'Key counts across modules' }, icon: 'target', id: 'stats', label: { ar: 'الأرقام الرئيسية', en: 'Headline stats' }, size: 'full' },
  { cat: 'Lists', desc: { ar: 'عناصر قاربت أو تجاوزت الـ SLA', en: 'Items close to or past SLA' }, icon: 'clock', id: 'sla', label: { ar: 'متابعة الـ SLA', en: 'SLA watchlist' }, size: 'half' },
  { cat: 'Lists', desc: { ar: 'طلبات بانتظارك', en: 'Requests waiting for you' }, icon: 'check-circle', id: 'approvals', label: { ar: 'قائمة الموافقات', en: 'Approvals queue' }, size: 'half' },
  { cat: 'Lists', desc: { ar: 'الحوادث المفتوحة', en: 'Open incidents by severity' }, icon: 'alert-triangle', id: 'incidents', label: { ar: 'الحوادث الحالية', en: 'Live incidents' }, size: 'half' },
  { cat: 'Lists', desc: { ar: 'المهام المسندة', en: 'Tasks assigned to the user' }, icon: 'check', id: 'tasks', label: { ar: 'مهامي', en: 'My tasks' }, size: 'half' },
  { cat: 'Utilities', desc: { ar: 'الاجتماعات والمواعيد', en: 'Meetings, due dates and events' }, icon: 'calendar', id: 'calendar', label: { ar: 'التقويم', en: 'Calendar' }, size: 'half' },
  { cat: 'Utilities', desc: { ar: 'آخر النشاطات', en: 'Recent activity across iHub' }, icon: 'activity', id: 'feed', label: { ar: 'التحديثات', en: 'Live feed' }, size: 'half' },
  { cat: 'Charts', desc: { ar: 'المصروف مقابل الميزانية', en: 'Spend against budget' }, icon: 'pie', id: 'budget', label: { ar: 'استهلاك الميزانية', en: 'Budget utilisation' }, size: 'half' },
  { cat: 'Charts', desc: { ar: 'ترتيب مصروف الإدارات', en: 'Department spend ranking' }, icon: 'chart', id: 'spend', label: { ar: 'المصروف حسب الإدارة', en: 'Spend by department' }, size: 'half' },
  { cat: 'Charts', desc: { ar: 'إنجاز القوائم اليومية', en: 'Completion of daily checklists' }, icon: 'shield', id: 'checklists', label: { ar: 'امتثال قوائم المراجعة', en: 'Checklist compliance' }, size: 'half' },
  { cat: 'Utilities', desc: { ar: 'أخبار وإعلانات', en: 'Company news and notices' }, icon: 'megaphone', id: 'announcements', label: { ar: 'الإعلانات', en: 'Announcements' }, size: 'half' },
];

/** @prototype index.html:L7055-L7064 */
const FINANCE_WIDGETS: readonly DashboardWidget[] = [
  { cat: 'Metrics', desc: { ar: 'الإيراد المتوقع والفعلي والفرق والإنجاز', en: 'Projected revenue, actual to date, variance, attainment' }, icon: 'coins', id: 'finKpis', label: { ar: 'أرقام الميزانية الرئيسية', en: 'Budget headline figures' }, size: 'full' },
  { cat: 'Charts', desc: { ar: 'شهريًا بآلاف الدنانير', en: 'Monthly, KWD thousands' }, icon: 'trend', id: 'pva', label: { ar: 'الإيراد المتوقع مقابل الفعلي', en: 'Projected vs actual revenue' }, size: 'full' },
  { cat: 'Charts', desc: { ar: 'المصروف مقابل الميزانية الشهرية', en: 'Spend against monthly budget' }, icon: 'chart', id: 'util', label: { ar: 'استهلاك الميزانية شهريًا', en: 'Budget utilisation by month' }, size: 'half' },
  { cat: 'Charts', desc: { ar: 'الرصيد المتبقي لكل إدارة', en: 'Remaining budget per department' }, icon: 'building', id: 'balance', label: { ar: 'الرصيد حسب الإدارة', en: 'Balance by department' }, size: 'half' },
  { cat: 'Charts', desc: { ar: 'التوقع عبر السنة المالية', en: 'Forecast across the financial year' }, icon: 'pie', id: 'projMonth', label: { ar: 'الإيراد المتوقع شهريًا', en: 'Projected revenue by month' }, size: 'half' },
  { cat: 'Lists', desc: { ar: 'مدفوعات بانتظار الموافقة', en: 'Payments waiting for CEO sign-off' }, icon: 'check-circle', id: 'ceo', label: { ar: 'موافقات الرئيس التنفيذي', en: 'CEO payment approvals' }, size: 'half' },
  { cat: 'Lists', desc: { ar: 'ميزانيات معتمدة مسبقًا', en: 'Budgets approved in advance' }, icon: 'check', id: 'preapproved', label: { ar: 'قائمة المعتمد مسبقًا', en: 'Pre-approved listing' }, size: 'half' },
  { cat: 'Lists', desc: { ar: 'طلبات معلّقة أو جزئية', en: 'Requests on hold or partly approved' }, icon: 'clock', id: 'onhold', label: { ar: 'معلّق / جزئي', en: 'On hold / partial' }, size: 'half' },
  { cat: 'Lists', desc: { ar: 'طلبات مرفوضة مؤخرًا', en: 'Recently rejected requests' }, icon: 'x-circle', id: 'rejected', label: { ar: 'قائمة المرفوض', en: 'Rejected listing' }, size: 'half' },
  { cat: 'Utilities', desc: { ar: 'جدول ملخص الرصيد', en: 'Budget balance summary table' }, icon: 'receipt', id: 'balanceReport', label: { ar: 'تقرير الرصيد', en: 'Balance report' }, size: 'full' },
];

/** @prototype index.html:L7068-L7075 */
const ACTION_SHEET_WIDGETS: readonly DashboardWidget[] = [
  { cat: 'Metrics', desc: { ar: 'النشطة وقيد المراجعة والمتأخرة والمكتملة', en: 'Active, in review, overdue and completed' }, icon: 'target', id: 'asKpis', label: { ar: 'مؤشرات أوراق الإجراء', en: 'Action sheet metrics' }, size: 'full' },
  { cat: 'Lists', desc: { ar: 'أوراق بانتظار الإنجاز', en: 'Multi-owner sheets awaiting completion' }, icon: 'inbox', id: 'asActive', label: { ar: 'أوراق الإجراء النشطة', en: 'Active action sheets' }, size: 'full' },
  { cat: 'Lists', desc: { ar: 'أوراق جاهزة للاعتماد', en: 'Sheets ready for review and sign-off' }, icon: 'check-circle', id: 'asSignoff', label: { ar: 'بانتظار الاعتماد', en: 'Awaiting sign-off' }, size: 'half' },
  { cat: 'Lists', desc: { ar: 'بنود تجاوزت موعدها', en: 'Line items past their due date' }, icon: 'alert-triangle', id: 'asOverdue', label: { ar: 'البنود المتأخرة', en: 'Overdue items' }, size: 'half' },
  { cat: 'Charts', desc: { ar: 'نسبة الإنجاز لكل إدارة', en: 'Completion rate per department' }, icon: 'building', id: 'asDept', label: { ar: 'التقدم حسب الإدارة', en: 'Progress by department' }, size: 'half' },
  { cat: 'Charts', desc: { ar: 'البنود المفتوحة لكل مالك', en: 'Open items per sheet owner' }, icon: 'users', id: 'asOwner', label: { ar: 'حسب المالك', en: 'By owner' }, size: 'half' },
  { cat: 'Charts', desc: { ar: 'الأوراق حسب المواقع', en: 'Sheets across venues' }, icon: 'map-pin', id: 'asLocation', label: { ar: 'حسب الموقع', en: 'By location' }, size: 'half' },
  { cat: 'Charts', desc: { ar: 'الأوراق المغلقة أسبوعيًا', en: 'Sheets closed per week' }, icon: 'trend', id: 'asTrend', label: { ar: 'اتجاه الإنجاز', en: 'Completion trend' }, size: 'half' },
];

/** @prototype index.html:L7079-L7085 */
const PETTY_CASH_WIDGETS: readonly DashboardWidget[] = [
  { cat: 'Metrics', desc: { ar: 'العهدة والمصروف والمسوّى والرصيد', en: 'Float, spent, settled and balance' }, icon: 'wallet', id: 'pcKpis', label: { ar: 'ملخص العهدة', en: 'Petty cash summary' }, size: 'full' },
  { cat: 'Lists', desc: { ar: 'طلبات بانتظار الموافقة', en: 'Requests waiting for approval' }, icon: 'inbox', id: 'pcPending', label: { ar: 'الطلبات المعلّقة', en: 'Pending requests' }, size: 'full' },
  { cat: 'Lists', desc: { ar: 'مبالغ تستحق التسوية', en: 'Cash to be settled soon' }, icon: 'clock', id: 'pcSettle', label: { ar: 'التسويات المستحقة', en: 'Settlements due' }, size: 'half' },
  { cat: 'Lists', desc: { ar: 'إيصالات لم تُرفق', en: 'Receipts still to be attached' }, icon: 'alert-triangle', id: 'pcMissing', label: { ar: 'مستندات ناقصة', en: 'Missing documents' }, size: 'half' },
  { cat: 'Charts', desc: { ar: 'استخدام العهدة لكل إدارة', en: 'Petty cash use per department' }, icon: 'chart', id: 'pcDept', label: { ar: 'المصروف حسب الإدارة', en: 'Spend by department' }, size: 'half' },
  { cat: 'Charts', desc: { ar: 'أوجه صرف العهدة', en: 'Where petty cash is going' }, icon: 'pie', id: 'pcCat', label: { ar: 'المصروف حسب الفئة', en: 'Spend by category' }, size: 'half' },
  { cat: 'Utilities', desc: { ar: 'أحدث الطلبات والتسويات', en: 'Latest requests and settlements' }, icon: 'receipt', id: 'pcHistory', label: { ar: 'السجل الأخير', en: 'Recent history' }, size: 'full' },
];

/**
 * The 5 dashboards a Settings admin can configure. `live: true` (Task
 * Manager only) means the prototype's screen already renders from this
 * config; the other 4 are layout-only (not yet built as real widget
 * screens), matching `ADMIN_DASHBOARDS` in the prototype.
 * @prototype index.html:L7035-L7087
 */
export const ADMIN_DASHBOARDS: readonly [AdminDashboardDefinition, ...AdminDashboardDefinition[]] = [
  {
    icon: 'check',
    id: 'tasks',
    label: { ar: 'مدير المهام', en: 'Task Manager' },
    live: true,
    mandatory: TASK_DASHBOARD_MANDATORY_IDS,
    where: { ar: 'مركز العمل › عام › المهام › لوحة المعلومات', en: 'Work Centre › General › Tasks › Dashboard' },
    widgets: TASK_DASHBOARD_WIDGETS,
  },
  {
    icon: 'home',
    id: 'home',
    label: { ar: 'نظرة عامة', en: 'Home overview' },
    live: false,
    mandatory: ['brief'],
    where: { ar: 'الرئيسية', en: 'Home' },
    widgets: HOME_WIDGETS,
  },
  {
    icon: 'wallet',
    id: 'finance',
    label: { ar: 'المالية والميزانيات', en: 'Finance & Budgets' },
    live: false,
    mandatory: ['finKpis'],
    where: { ar: 'المالية والميزانيات › لوحة المعلومات', en: 'Finance & Budgets › Dashboard' },
    widgets: FINANCE_WIDGETS,
  },
  {
    icon: 'folder',
    id: 'actionSheet',
    label: { ar: 'ورقة الإجراء', en: 'Action Sheet' },
    live: false,
    mandatory: ['asKpis'],
    where: { ar: 'المالية › ورقة الإجراء', en: 'Finance › Action Sheet' },
    widgets: ACTION_SHEET_WIDGETS,
  },
  {
    icon: 'dollar',
    id: 'pettyCash',
    label: { ar: 'العهدة النقدية', en: 'Petty Cash' },
    live: false,
    mandatory: ['pcKpis'],
    where: { ar: 'المالية › العهدة النقدية', en: 'Finance & Budgets › Petty Cash' },
    widgets: PETTY_CASH_WIDGETS,
  },
];

export function findAdminDashboard(id: DashboardId): AdminDashboardDefinition {
  return ADMIN_DASHBOARDS.find((dashboard) => dashboard.id === id) ?? ADMIN_DASHBOARDS[0];
}
