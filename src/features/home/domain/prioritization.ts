import { DUE_WEIGHT, PRIORITY_WEIGHT } from '../constants/priorityWeights';
import type { QueueAction, QueueIncident } from '../types/queue.types';
import { slaOf } from './sla';

/**
 * Action urgency score: priority weight + due weight + a log-scaled financial
 * weight (capped at 25) + an SLA bonus (breached +30, at-risk +12), rounded.
 * @prototype ihub/index.html:L10315-L10322 `scoreAction`
 */
export function scoreAction(action: QueueAction) {
  let score =
    PRIORITY_WEIGHT[action.priority] + DUE_WEIGHT[action.dueState];
  if (action.amountNum > 0)
    score += Math.min(25, Math.log10(action.amountNum) * 5);
  const sla = slaOf(action).state;
  if (sla === 'breached') score += 30;
  else if (sla === 'at-risk') score += 12;
  return Math.round(score);
}

/** @prototype ihub/index.html:L10323-L10328 `scoreIncident` — no rounding, no financial term. */
export function scoreIncident(incident: QueueIncident) {
  let score = PRIORITY_WEIGHT[incident.severity];
  if (incident.sla === 'breached') score += 50;
  else if (incident.sla === 'at-risk') score += 25;
  return score;
}

/** Score-descending; ties keep input order (stable sort), like the prototype. */
export function rankActions(list: readonly QueueAction[]) {
  return list
    .map((action) => ({ action, score: scoreAction(action) }))
    .sort((a, b) => b.score - a.score)
    .map(({ action }) => action);
}

/**
 * The approvals ranking: `rankActions`, then pinned items first as a stable
 * partition (each side keeps score order).
 * @prototype ihub/index.html:L12133-L12136 `ranked`
 */
export function rankQueue(actions: readonly QueueAction[]) {
  const ranked = rankActions(actions);
  return [
    ...ranked.filter((action) => action.pinned),
    ...ranked.filter((action) => !action.pinned),
  ];
}

/** Incidents ordered by `scoreIncident` descending (stable). */
export function rankIncidents(incidents: readonly QueueIncident[]) {
  return incidents
    .map((incident) => ({ incident, score: scoreIncident(incident) }))
    .sort((a, b) => b.score - a.score)
    .map(({ incident }) => incident);
}
