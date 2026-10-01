import {
  DEFAULT_FRACTION,
  DEFAULT_TARGET_H,
  JOB_ORDER_DEFAULT_TARGET_H,
  JOB_ORDER_TARGET_H,
  SLA_FRACTION,
  SLA_OVERRIDE,
  SLA_TARGET_H,
} from '../constants/slaPolicy';
import type { SlaResult, SlaSubject } from '../types/queue.types';

const isJobOrder = (subject: SlaSubject) => subject.id.startsWith('JO-');

/** Job orders derive their elapsed fraction from the free-text `due` label. */
function jobOrderFraction(due: string | undefined) {
  const text = due ?? '';
  if (/today/i.test(text)) return 0.94;
  if (/tomorrow/i.test(text)) return 0.71;
  if (/2 days/i.test(text)) return 0.52;
  return 0.28;
}

/**
 * SLA state for an action or job order. There is no clock: the state comes
 * from static fraction tables (keyed by `dueState`) and per-id overrides.
 * Breached when `left <= 0` (rounded to 1 decimal); at-risk when the rounded
 * `elapsed / target >= 0.75`.
 * @prototype ihub/index.html:L10286-L10308 `slaOf`
 */
export function slaOf(subject: SlaSubject): SlaResult {
  const jobOrder = isJobOrder(subject);
  const target = jobOrder
    ? (JOB_ORDER_TARGET_H[subject.priority ?? ''] ??
      JOB_ORDER_DEFAULT_TARGET_H)
    : (SLA_TARGET_H[subject.kind ?? ''] ?? DEFAULT_TARGET_H);
  const fraction =
    SLA_OVERRIDE[subject.id] ??
    (jobOrder
      ? jobOrderFraction(subject.due)
      : (SLA_FRACTION[subject.dueState ?? ''] ?? DEFAULT_FRACTION));
  const elapsed = Math.round(target * fraction * 10) / 10;
  const left = Math.round((target - elapsed) * 10) / 10;
  const pct = elapsed / target;
  return {
    elapsed,
    left,
    pct,
    state: left <= 0 ? 'breached' : pct >= 0.75 ? 'at-risk' : 'ok',
    target,
  };
}

/** Localised unit and phrase captions supplied by the caller (prototype `T(en, ar)` pairs). */
export type SlaLabels = Readonly<{
  days: string;
  hours: string;
  left: string;
  minutes: string;
  over: string;
  target: string;
  waiting: string;
}>;

/**
 * Compact duration. Sub-hour → minutes, sub-day → one-decimal hours, else
 * days plus rounded remainder hours. No rollover is applied (`23.96` → "24h",
 * `47.6` → "1d 24h"): parity with the prototype is intentional.
 * @prototype ihub/index.html:L10299-L10305 `slaDur`
 */
export function slaDur(hours: number, labels: SlaLabels) {
  const value = Math.abs(hours);
  if (value < 1) return `${String(Math.round(value * 60))}${labels.minutes}`;
  if (value < 24)
    return `${String(Math.round(value * 10) / 10)}${labels.hours}`;
  const days = Math.floor(value / 24);
  const remainder = Math.round(value % 24);
  return `${String(days)}${labels.days}${
    remainder ? ` ${String(remainder)}${labels.hours}` : ''
  }`;
}

/** @prototype ihub/index.html:L11105-L11111 `slaLabelOf` */
export function slaLabelOf(subject: SlaSubject, labels: SlaLabels) {
  const sla = slaOf(subject);
  return sla.state === 'breached'
    ? `${labels.over}${slaDur(sla.left, labels)}`
    : `${slaDur(sla.left, labels)}${labels.left}`;
}

/** @prototype ihub/index.html:L11113 `slaTip` */
export function slaTip(subject: SlaSubject, labels: SlaLabels) {
  const sla = slaOf(subject);
  return `${labels.target}${slaDur(sla.target, labels)} · ${labels.waiting}${slaDur(sla.elapsed, labels)}`;
}
