import type { DashboardWidget } from '../types/dashboardConfig.types';

/**
 * The Task Manager dashboard's widget catalogue — shared between the
 * (approved, M8.1-M8.4) Work Centre Tasks dashboard and this Settings
 * configuration builder in the prototype (`window.TASK_DASH_WIDGETS`).
 * M11.2 does not render this catalogue inside the real Tasks dashboard;
 * runtime integration is M11.3's job.
 * @prototype index.html:L16909-L16920
 */
export const TASK_DASHBOARD_WIDGETS: readonly DashboardWidget[] = [
  {
    cat: 'Metrics',
    desc: { ar: 'إجمالي المهام وقيد التنفيذ والمكتملة والحرجة', en: 'Total, in-progress, completed and critical counts' },
    icon: 'target',
    id: 'metrics',
    label: { ar: 'مؤشرات المهام', en: 'Task metrics' },
    size: 'full',
  },
  {
    cat: 'Metrics',
    desc: { ar: 'أوقات الاستجابة والحل والإغلاق', en: 'Response, resolution, closing and completion times' },
    icon: 'clock',
    id: 'slaPerf',
    label: { ar: 'أداء اتفاقية الخدمة', en: 'SLA performance' },
    size: 'full',
  },
  {
    cat: 'Metrics',
    desc: { ar: 'ملخص الامتثال مع الاتجاه', en: 'Pending and in-progress SLA summary with trend' },
    icon: 'shield',
    id: 'compliance',
    label: { ar: 'الامتثال للخدمة', en: 'SLA compliance' },
    size: 'half',
    tall: true,
  },
  {
    cat: 'Charts',
    desc: { ar: 'توزيع المهام حسب المصدر', en: 'Task breakdown by originating source' },
    icon: 'target',
    id: 'source',
    label: { ar: 'حسب مصدر المهمة', en: 'By source of task' },
    size: 'half',
  },
  {
    cat: 'Charts',
    desc: { ar: 'توزيع المهام حسب الإدارة المالكة', en: 'Task distribution by owning department' },
    icon: 'users',
    id: 'dependency',
    label: { ar: 'حسب التبعية', en: 'By dependency' },
    size: 'half',
  },
  {
    cat: 'Lists',
    desc: { ar: 'المهام الحرجة وعالية الأولوية', en: 'Critical and high-priority open tasks' },
    icon: 'star',
    id: 'highPri',
    label: { ar: 'المهام ذات الأولوية العالية', en: 'High priority tasks' },
    size: 'full',
  },
  {
    cat: 'Charts',
    desc: { ar: 'توزيع المهام حسب الإدارة', en: 'Department-wise task distribution' },
    icon: 'chart',
    id: 'byDept',
    label: { ar: 'حسب الإدارة', en: 'By department' },
    size: 'half',
  },
  {
    cat: 'Charts',
    desc: { ar: 'حجم المهام حسب الشريك', en: 'Task load by partner department' },
    icon: 'users',
    id: 'matrix',
    label: { ar: 'حسب الشريك المصفوفي', en: 'By matrix partner' },
    size: 'half',
  },
  {
    cat: 'Charts',
    desc: { ar: 'تأثير المهام حسب المنطقة', en: 'Area-wise task impact with drill-down' },
    icon: 'building',
    id: 'impacted',
    label: { ar: 'المناطق المتأثرة', en: 'Impacted areas' },
    size: 'full',
  },
  {
    cat: 'Lists',
    desc: { ar: 'العناصر الحرجة المفتوحة', en: 'Open critical items that need action' },
    icon: 'bolt',
    id: 'critical',
    label: { ar: 'حرِج — يتطلب إجراءً', en: 'Critical — requires action' },
    size: 'full',
  },
  {
    cat: 'Utilities',
    desc: { ar: 'خريطة توافر الموارد وأعباء العمل', en: 'Resource availability and workload heat map' },
    icon: 'grid',
    id: 'workload',
    label: { ar: 'توافر موارد الإدارات وأعباء العمل', en: 'Department resource availability & workload' },
    size: 'full',
  },
];

export const TASK_DASHBOARD_MANDATORY_IDS = ['metrics', 'slaPerf'] as const;
