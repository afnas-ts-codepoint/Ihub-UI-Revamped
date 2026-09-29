/**
 * Working-days helpers, Friday–Saturday weekend.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L17296-L17304 (`depIsWeekend`, `depAddWorkdays`,
 * `depWorkdaysBetween`, `DEP_REMIND_WORKDAYS`). Scoped to exactly what the tasks
 * dependency reminder needs — no generic calendar/holiday-aware date library.
 */

/** How many working days ahead a pending dependency's due date triggers a reminder. */
export const REMIND_WORKDAYS = 5;

/** Friday and Saturday are the weekend, matching the source region. */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6;
}

/** Adds `count` working days (skipping Fri/Sat) to `from`, returning a new Date. */
export function addWorkdays(from: Date, count: number): Date {
  const result = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let added = 0;
  while (added < count) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result)) added += 1;
  }
  return result;
}

/**
 * Number of working days between two dates. Positive when `to` is in the future,
 * negative (days overdue) when `to` has already passed.
 */
export function workdaysBetween(from: Date, to: Date): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  if (end <= start) {
    return Math.round((end.getTime() - start.getTime()) / 86_400_000);
  }
  let count = 0;
  const cursor = new Date(start);
  while (cursor < end) {
    cursor.setDate(cursor.getDate() + 1);
    if (!isWeekend(cursor)) count += 1;
  }
  return count;
}

/** Accepts ISO `yyyy-mm-dd` or `MM/DD/YYYY`; returns null when unparseable. */
export function parseFlexibleDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (us) return new Date(Number(us[3]), Number(us[1]) - 1, Number(us[2]));
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** `MM/DD/YYYY`, matching the legacy sample-data format used for dependency due dates. */
export function toUsDate(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${String(date.getFullYear())}`;
}
