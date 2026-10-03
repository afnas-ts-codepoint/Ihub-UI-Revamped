/**
 * Illustrative aggregate figures for the Overview "Analytics & Insights"
 * panels. Fixed prototype fixtures: nothing here is derived from the queues,
 * and the labels are English in every locale, as in the prototype.
 * @prototype index.html:L14078-L14132 `ANLY_*`
 */
export type AnalyticsDatum = Readonly<{
  color: string;
  label: string;
  value: number;
}>;

export type AnalyticsTone = 'bad' | 'ok' | 'warn';

export const ANALYTICS_STATUS: readonly AnalyticsDatum[] = [
  { color: '#6D74C5', label: 'New', value: 18 },
  { color: 'var(--info)', label: 'Assigned', value: 24 },
  { color: 'var(--accent)', label: 'In progress', value: 42 },
  { color: 'var(--warn)', label: 'Review', value: 16 },
  { color: 'var(--ok)', label: 'Done', value: 64 },
];

export const ANALYTICS_PRIORITY: readonly AnalyticsDatum[] = [
  { color: 'var(--bad)', label: 'Critical', value: 22 },
  { color: 'var(--brand-orange)', label: 'High', value: 46 },
  { color: 'var(--warn)', label: 'Medium', value: 58 },
  { color: 'var(--info)', label: 'Low', value: 38 },
];

export const ANALYTICS_SLA_STATS: readonly Readonly<{
  key: 'atRisk' | 'breached' | 'met';
  tone: AnalyticsTone;
  value: string;
}>[] = [
  { key: 'met', tone: 'ok', value: '82%' },
  { key: 'atRisk', tone: 'warn', value: '12%' },
  { key: 'breached', tone: 'bad', value: '6%' },
];

/** Overall SLA achievement drawn in the ring (82%). */
export const ANALYTICS_SLA_RING = 0.82;

export const ANALYTICS_TOP_DEPARTMENTS: readonly (AnalyticsDatum &
  Readonly<{ max: number }>)[] = [
  { color: 'var(--bad)', label: 'Facilities', max: 46, value: 46 },
  { color: 'var(--bad)', label: 'Maintenance', max: 46, value: 38 },
  { color: 'var(--warn)', label: 'Safety', max: 46, value: 29 },
  { color: 'var(--warn)', label: 'Operations', max: 46, value: 24 },
  { color: 'var(--info)', label: 'Housekeeping', max: 46, value: 15 },
];

export const ANALYTICS_AGING: readonly AnalyticsDatum[] = [
  { color: 'var(--ok)', label: '0-1d', value: 34 },
  { color: 'var(--ok)', label: '2-3d', value: 28 },
  { color: 'var(--warn)', label: '4-7d', value: 19 },
  { color: 'var(--warn)', label: '8-14d', value: 12 },
  { color: 'var(--bad)', label: '15d+', value: 7 },
];

export const ANALYTICS_DEPARTMENT_VOLUME: readonly Readonly<{
  label: string;
  max: number;
  value: number;
}>[] = [
  { label: 'Facilities', max: 46, value: 46 },
  { label: 'Maintenance', max: 46, value: 42 },
  { label: 'Safety', max: 46, value: 29 },
  { label: 'Operations', max: 46, value: 24 },
  { label: 'Housekeeping', max: 46, value: 15 },
];

export const ANALYTICS_DEPARTMENT_PERFORMANCE: readonly Readonly<{
  label: string;
  pct: number;
  tone: AnalyticsTone;
}>[] = [
  { label: 'Maintenance', pct: 81, tone: 'ok' },
  { label: 'Facilities', pct: 63, tone: 'warn' },
  { label: 'Safety', pct: 47, tone: 'bad' },
  { label: 'Operations', pct: 88, tone: 'ok' },
  { label: 'Housekeeping', pct: 74, tone: 'warn' },
];

export const ANALYTICS_TREND_RAISED: readonly number[] = [12, 15, 11, 18, 14, 20, 17];
export const ANALYTICS_TREND_RESOLVED: readonly number[] = [10, 13, 12, 16, 15, 18, 19];

export const ANALYTICS_BREACH: readonly AnalyticsDatum[] = [
  { color: 'var(--bad)', label: 'Facilities', value: 9 },
  { color: 'var(--bad)', label: 'Maintenance', value: 7 },
  { color: 'var(--bad)', label: 'Safety', value: 5 },
  { color: 'var(--bad)', label: 'Operations', value: 3 },
  { color: 'var(--bad)', label: 'Housekeeping', value: 1 },
];
