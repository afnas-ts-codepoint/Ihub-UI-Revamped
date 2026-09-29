import { describe, expect, it } from 'vitest';

import { filterWidgetsForDisplay, orderWidgetsForDisplay, widgetCategories } from './widgetOrdering';
import type { DashboardWidget } from '../types/dashboardConfig.types';

const widgets: readonly DashboardWidget[] = [
  { cat: 'Metrics', desc: { ar: 'م', en: 'Metrics desc' }, icon: 'target', id: 'metrics', label: { ar: 'م', en: 'Task metrics' }, size: 'full' },
  { cat: 'Metrics', desc: { ar: 'س', en: 'SLA desc' }, icon: 'clock', id: 'slaPerf', label: { ar: 'س', en: 'SLA performance' }, size: 'full' },
  { cat: 'Charts', desc: { ar: 'ص', en: 'Source desc' }, icon: 'target', id: 'source', label: { ar: 'ص', en: 'By source' }, size: 'half' },
];

describe('orderWidgetsForDisplay', () => {
  it('puts shown widgets first in their configured order, then the rest', () => {
    const ordered = orderWidgetsForDisplay(['source', 'metrics'], widgets);
    expect(ordered.map((w) => w.id)).toEqual(['source', 'metrics', 'slaPerf']);
  });

  it('ignores ids that do not resolve to a widget', () => {
    const ordered = orderWidgetsForDisplay(['unknown', 'metrics'], widgets);
    expect(ordered.map((w) => w.id)).toEqual(['metrics', 'slaPerf', 'source']);
  });
});

describe('filterWidgetsForDisplay', () => {
  it('filters by category', () => {
    const result = filterWidgetsForDisplay(widgets, { category: 'Charts', query: '' });
    expect(result.map((w) => w.id)).toEqual(['source']);
  });

  it('filters by search across label/desc/labelAr', () => {
    const result = filterWidgetsForDisplay(widgets, { category: 'All', query: 'sla' });
    expect(result.map((w) => w.id)).toEqual(['slaPerf']);
  });
});

describe('widgetCategories', () => {
  it('lists All first, then catalogue-order unique categories', () => {
    expect(widgetCategories(widgets)).toEqual(['All', 'Metrics', 'Charts']);
  });
});
