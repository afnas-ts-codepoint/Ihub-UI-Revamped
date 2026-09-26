import type {
  SlaLevel,
  SlaPerformance,
  SlaPerformanceMap,
  SlaPriorityId,
  WorkAreaFormValues,
  WorkAreaMapping,
} from '../types/sla.types';

export const onTimePercentage = (performance: SlaPerformance) =>
  performance.workOrders
    ? Math.round((performance.onTime / performance.workOrders) * 1000) / 10
    : 0;
export function overallPerformance(
  levels: readonly SlaLevel[],
  performance: SlaPerformanceMap,
) {
  const totals = levels.reduce(
    (result, level) => ({
      onTime: result.onTime + performance[level.id].onTime,
      workOrders: result.workOrders + performance[level.id].workOrders,
    }),
    { onTime: 0, workOrders: 0 },
  );
  return { ...totals, percentage: onTimePercentage(totals) };
}
export function parseSlaHours(value: string) {
  const amount = Number.parseFloat(value) || 0;
  return /day/.test(value) ? amount * 24 : amount;
}
export function timeUsedProgress(agreedValue: string, usedValue: string) {
  const agreed = parseSlaHours(agreedValue);
  const used = parseSlaHours(usedValue);
  const percentage = agreed ? Math.round((used / agreed) * 100) : 0;
  return {
    agreed,
    fillPercentage: Math.min(100, percentage),
    over: used > agreed,
    percentage,
    ratio: Math.min(150, percentage),
    used,
  };
}
export function filterWorkAreaMappings(
  mappings: readonly WorkAreaMapping[],
  query: string,
  priority: 'all' | SlaPriorityId,
) {
  const normalized = query.trim().toLocaleLowerCase();
  return mappings.filter(
    (entry) =>
      (priority === 'all' || entry.priorities.includes(priority)) &&
      (!normalized ||
        `${entry.area} ${entry.conditional}`
          .toLocaleLowerCase()
          .includes(normalized)),
  );
}
export function saveWorkAreaMapping(
  mappings: readonly WorkAreaMapping[],
  editingId: string | null,
  values: WorkAreaFormValues,
): readonly WorkAreaMapping[] {
  const area = values.area.trim();
  if (!area) return mappings;
  const priorities: readonly SlaPriorityId[] = values.priorities.length
    ? values.priorities
    : ['P3'];
  const next: WorkAreaMapping = {
    area,
    conditional: values.conditional.trim(),
    id: editingId ?? `mapping-${String(mappings.length + 1)}`,
    priorities,
    resolution: values.resolution.trim(),
    response: values.response.trim(),
  };
  return editingId
    ? mappings.map((entry) => (entry.id === editingId ? next : entry))
    : [...mappings, next];
}
