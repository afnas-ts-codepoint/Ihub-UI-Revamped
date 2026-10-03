import type {
  HomeReportCategory,
  HomeReportItem,
} from '../types/reports.types';

/**
 * The Home "Analytics & Reports" catalogue: 7 categories, 17 reports. It is a
 * separate list from the standalone `/reports` library (D12).
 * @prototype index.html:L14461-L14493 `REP_CATS`
 */
export const HOME_REPORT_CATEGORIES = [
  {
    id: 'hr',
    items: [
      { id: 'attendance-summary', label: { ar: 'ملخص الحضور', en: 'Attendance Summary' } },
      { id: 'attendance-detail', label: { ar: 'تفاصيل الحضور', en: 'Attendance Detailed' } },
      { id: 'leave-balance', label: { ar: 'رصيد الإجازات', en: 'Leave Balance' } },
    ],
    label: { ar: 'الموارد البشرية', en: 'HR' },
  },
  {
    id: 'workforce',
    items: [
      { id: 'overtime-summary', label: { ar: 'ملخص العمل الإضافي', en: 'Overtime Summary' } },
      { id: 'overtime-detail', label: { ar: 'تفاصيل العمل الإضافي', en: 'Overtime Detailed' } },
    ],
    label: { ar: 'القوى العاملة', en: 'Workforce' },
  },
  {
    id: 'performance',
    items: [
      { id: 'appraisal-summary', label: { ar: 'ملخص التقييم', en: 'Appraisal Summary' } },
    ],
    label: { ar: 'الأداء', en: 'Performance' },
  },
  {
    id: 'finance',
    items: [
      { id: 'budget-vs-actual', label: { ar: 'الميزانية مقابل الفعلي', en: 'Budget vs Actual' } },
      { id: 'budget-utilisation', label: { ar: 'استخدام الميزانية', en: 'Budget Utilisation' } },
      { id: 'pc-pending', label: { ar: 'مشتريات معلقة', en: 'Purchasing Pending' } },
      { id: 'petty-cash', label: { ar: 'حركة النثرية', en: 'Petty Cash Movement' } },
    ],
    label: { ar: 'المالية', en: 'Finance' },
  },
  {
    id: 'operations',
    items: [
      { id: 'job-orders', label: { ar: 'المهام', en: 'Tasks' } },
      { id: 'violations', label: { ar: 'سجل المخالفات', en: 'Violations Register' } },
      { id: 'incidents', label: { ar: 'سجل الحوادث', en: 'Incident Log' } },
      { id: 'enquiries', label: { ar: 'سجل الاستفسارات', en: 'Enquiries Register' } },
      { id: 'observations', label: { ar: 'سجل الملاحظات', en: 'Observations Register' } },
    ],
    label: { ar: 'العمليات', en: 'Operations' },
  },
  {
    id: 'quality',
    items: [
      { id: 'checklists', label: { ar: 'امتثال قوائم المراجعة', en: 'Checklist Compliance' } },
    ],
    label: { ar: 'الجودة', en: 'Quality' },
  },
  {
    id: 'system',
    items: [{ id: 'audit-trail', label: { ar: 'سجل التدقيق', en: 'Audit Trail' } }],
    label: { ar: 'النظام', en: 'System' },
  },
] as const satisfies readonly HomeReportCategory[];

export const DEFAULT_HOME_REPORT_CATEGORY = HOME_REPORT_CATEGORIES[0];

/** The prototype falls back to the first category when the id is unknown. */
export function homeReportCategory(id: string): HomeReportCategory {
  return (
    HOME_REPORT_CATEGORIES.find((category) => category.id === id) ??
    DEFAULT_HOME_REPORT_CATEGORY
  );
}

/** The prototype falls back to the category's first report when the id is unknown. */
export function homeReportItem(
  category: HomeReportCategory,
  id: string,
): HomeReportItem {
  return category.items.find((item) => item.id === id) ?? category.items[0];
}
