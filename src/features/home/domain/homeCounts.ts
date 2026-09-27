import type { HomeBannerData, HomeCounts } from '../types/home.types';

/** @prototype index.html:L12521-L12783 and L14899-L15027 count rules. */
export function deriveHomeCounts(data: HomeBannerData): HomeCounts {
  const overdue = data.actions.filter(
    (action) => action.dueState === 'overdue',
  ).length;
  const today = data.actions.filter(
    (action) => action.dueState === 'today',
  ).length;
  const soon = data.actions.filter(
    (action) => action.dueState === 'soon',
  ).length;
  const later = data.actions.filter(
    (action) => action.dueState === 'later',
  ).length;
  const urgent = data.actions.filter(
    (action) =>
      action.dueState === 'overdue' || action.priority === 'critical',
  ).length;
  const criticalIncidents = data.incidents.filter(
    (incident) => incident.severity === 'critical',
  ).length;
  const breaches = data.incidents.filter(
    (incident) => incident.sla === 'breached',
  ).length;
  const newTasks = data.jobOrders.filter((jobOrder) => jobOrder.isNew).length;
  const assignedJobs = data.jobOrders.filter(
    (jobOrder) => jobOrder.status !== 'New',
  ).length;
  const actions = data.actions.length;

  return {
    actions,
    assigned: actions + data.assignedSheets.length + assignedJobs,
    breaches,
    criticalIncidents,
    incidents: data.incidents.length,
    later,
    newTasks,
    onTrackPercent: actions
      ? Math.round(((actions - overdue) / actions) * 100)
      : 100,
    overdue,
    soon,
    today,
    totalTasks: data.jobOrders.length,
    urgent,
  };
}
