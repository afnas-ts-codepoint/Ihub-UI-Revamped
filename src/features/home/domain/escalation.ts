import type { HomeIncidentSeverity } from '../types/home.types';
import type { QueueAction } from '../types/queue.types';

/**
 * Escalating an action forces `priority: critical` and `dueState: today`.
 * The `due` display text is deliberately left untouched (prototype quirk).
 * @prototype ihub/index.html:L12174-L12182 `actOnAction('escalate')`
 */
export function escalateAction(action: QueueAction): QueueAction {
  return { ...action, dueState: 'today', priority: 'critical' };
}

const SEVERITY_LADDER: readonly HomeIncidentSeverity[] = [
  'low',
  'medium',
  'high',
  'critical',
];

/**
 * One step up `low → medium → high → critical`, capped at critical. An
 * unknown severity (index -1) lands on `low`, as in the prototype.
 * @prototype ihub/index.html:L12225-L12233 `actOnIncident('escalate')`
 */
export function escalateSeverity(
  severity: HomeIncidentSeverity,
): HomeIncidentSeverity {
  const index = SEVERITY_LADDER.indexOf(severity) + 1;
  return SEVERITY_LADDER[Math.min(SEVERITY_LADDER.length - 1, index)] ?? 'low';
}

/** Text before the first em-dash separator, used in the escalation toast. */
export function actionShortTitle(title: string) {
  return title.split(' — ')[0] ?? title;
}
