import type { HomeTaskDraft, QueueJobOrder } from '../types/queue.types';

/**
 * The record a Home task row, job-order card or tracker entry opens in the
 * Home task form (`setTaskOpen(jo)`).
 * @prototype index.html:L14693, L14730, L14739 `setTaskOpen(jo)`
 */
export const jobOrderTaskDraft = (jobOrder: QueueJobOrder): HomeTaskDraft => ({
  dept: jobOrder.dept,
  id: jobOrder.id,
  kind: jobOrder.kind,
  location: jobOrder.location,
  priority: jobOrder.priority,
  title: jobOrder.title,
});
