import type { DashboardWidget } from '../types/dashboardConfig.types';

/**
 * Shown-first ordering: widgets currently on, in their configured order,
 * followed by the remaining available widgets in catalogue order.
 * @prototype index.html:L7339 (`ordered`)
 */
export function orderWidgetsForDisplay(
  ids: readonly string[],
  widgets: readonly DashboardWidget[],
): DashboardWidget[] {
  const byId = new Map(widgets.map((widget) => [widget.id, widget]));
  const shown = ids
    .map((id) => byId.get(id))
    .filter((widget): widget is DashboardWidget => widget !== undefined);
  const rest = widgets.filter((widget) => !ids.includes(widget.id));
  return [...shown, ...rest];
}

/**
 * Category pill filter + label/description search, applied after
 * ordering. The search string matches the prototype's own
 * `(w.label + ' ' + w.desc + ' ' + w.labelAr)` — the English label and
 * description plus the Arabic label, regardless of the active locale (a
 * genuine prototype quirk, preserved rather than "fixed").
 * @prototype index.html:L7340
 */
export function filterWidgetsForDisplay(
  widgets: readonly DashboardWidget[],
  options: Readonly<{ category: string; query: string }>,
): DashboardWidget[] {
  const query = options.query.trim().toLowerCase();
  return widgets.filter((widget) => {
    if (options.category !== 'All' && widget.cat !== options.category) return false;
    if (!query) return true;
    return `${widget.label.en} ${widget.desc.en} ${widget.label.ar}`
      .toLowerCase()
      .includes(query);
  });
}

/** Category pills shown above the widget list, `All` first, catalogue order thereafter. */
export function widgetCategories(
  widgets: readonly DashboardWidget[],
): string[] {
  const seen = new Set<string>();
  const categories: string[] = ['All'];
  for (const widget of widgets) {
    if (!seen.has(widget.cat)) {
      seen.add(widget.cat);
      categories.push(widget.cat);
    }
  }
  return categories;
}
