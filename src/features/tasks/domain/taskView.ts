import type { Task, TaskStage } from '../types/task.types';
import { addWorkdays, REMIND_WORKDAYS, workdaysBetween } from '@/shared/lib/date/workdays';

/**
 * Task View decorative/derived helpers.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L17244-L18067 (`tdpSeed`, `TDP_PROJECTS`,
 * `TDP_ASSET_CATS`, header stats, started/target dates). All of these are seeded
 * from the task id or fixed constants — never real elapsed time — and are ported
 * here verbatim as decorative display values, not real computation.
 */

/** Deterministic small integer seed from a task id, matching the prototype's `tdpSeed`. */
export function taskViewSeed(id: string): number {
  let seed = 0;
  for (let index = 0; index < id.length; index += 1) {
    seed = (seed * 31 + id.charCodeAt(index)) >>> 0;
  }
  return seed;
}

const TASK_STAGE_ORDER: readonly TaskStage[] = ['Open', 'Review', 'In progress', 'Done'];

/** 0-based index into the 8-item TASK_STAGES track for the task's current stage. */
export function stageIndex(stage: TaskStage): number {
  if (stage === 'Done') return 7;
  if (stage === 'Review') return 6;
  if (stage === 'In progress') return 5;
  return 4;
}

export function isKnownStage(stage: string): stage is TaskStage {
  return (TASK_STAGE_ORDER as readonly string[]).includes(stage);
}

/** `Xh Ym` display, matching the header stat figures. */
export function formatMinutes(totalMinutes: number): string {
  return `${String(Math.floor(totalMinutes / 60))}h ${String(totalMinutes % 60)}m`;
}

export type TaskViewHeaderStats = Readonly<{
  completionMinutes: number;
  resolutionMinutes: number;
  responseMinutes: number;
  verificationMinutes: number;
}>;

export function headerStats(seed: number): TaskViewHeaderStats {
  const responseMinutes = 20 + (seed % 90);
  const verificationMinutes = 2 + (seed % 20);
  const resolutionMinutes = 40 + (seed % 160);
  const completionMinutes = resolutionMinutes + 60 + (seed % 240);
  return { completionMinutes, resolutionMinutes, responseMinutes, verificationMinutes };
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function startedTargetTimes(seed: number): Readonly<{ startedTime: string; targetTime: string }> {
  return {
    startedTime: `${pad2(8 + (seed % 10))}:${pad2((seed * 7) % 60)}`,
    targetTime: `${pad2(8 + ((seed + 5) % 10))}:${pad2(((seed + 3) * 11) % 60)}`,
  };
}

export function daysElapsedFor(seed: number): number {
  return 30 + (seed % 280);
}

export function ownerNameFor(seed: number, team: readonly string[]): string {
  return team[seed % team.length] ?? team[0] ?? '';
}

export function assetCodeFor(seed: number): string {
  return `AST-2026-${String(1000 + (seed % 9000)).slice(0, 4)}`;
}

const PROJECT_BY_DEPARTMENT: Readonly<Record<string, readonly [string, string]>> = {
  Facilities: ['Guest Comfort Programme', 'Facility Services'],
  Housekeeping: ['Facility Standards Programme', 'Facility Standards'],
  Maintenance: ['Ride Safety Upgrade', 'Safety Systems'],
  Operations: ['Operational Excellence', 'Service Operations'],
  Safety: ['Safety Compliance Initiative', 'Risk & Compliance'],
};
const DEFAULT_PROJECT: readonly [string, string] = ['General Operations', 'Operations'];

export function projectFor(department: string): readonly [string, string] {
  return PROJECT_BY_DEPARTMENT[department] ?? DEFAULT_PROJECT;
}

const ASSET_CATEGORY_BY_DEPARTMENT: Readonly<Record<string, string>> = {
  Facilities: 'Building Systems',
  Housekeeping: 'Facility Assets',
  Maintenance: 'Rides & Attractions',
  Operations: 'Operational Assets',
  Safety: 'Safety Equipment',
};

export function assetCategoryFor(department: string): string {
  return ASSET_CATEGORY_BY_DEPARTMENT[department] ?? 'Facility Assets';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parses `DD Mon` / `DD Mon YYYY` (year defaults to 2026), matching `tepParse`. */
function parseTaskDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = /^(\d{1,2})\s+([A-Za-z]{3,})\.?,?\s*(\d{4})?$/.exec(trimmed);
  if (!match) return null;
  const monthName = `${match[2]?.slice(0, 1).toUpperCase() ?? ''}${match[2]?.slice(1, 3).toLowerCase() ?? ''}`;
  const month = MONTHS.indexOf(monthName);
  if (month < 0) return null;
  const year = match[3] ? Number(match[3]) : 2026;
  return new Date(year, month, Number(match[1]));
}

function formatTaskDate(date: Date): string {
  return `${pad2(date.getDate())} ${MONTHS[date.getMonth()] ?? ''} ${String(date.getFullYear())}`;
}

/**
 * Started / target display dates, matching the prototype's `initialStart`/`initialDue`
 * derivation: the target defaults to the task's due date (falling back to a fixed
 * date when unparseable), and the start is 3 days earlier when the target falls
 * before the fixed reference date, otherwise a fixed default.
 */
export function scheduleDatesFor(due: string): Readonly<{ start: string; target: string }> {
  const parsedDue = parseTaskDate(due);
  const target = parsedDue ? formatTaskDate(parsedDue) : '06 Sep 2026';
  const targetDate = parsedDue ?? new Date(2026, 8, 6);
  const reference = new Date(2026, 8, 3);
  if (targetDate < reference) {
    const start = new Date(targetDate);
    start.setDate(start.getDate() - 3);
    return { start: formatTaskDate(start), target };
  }
  return { start: '03 Sep 2026', target };
}

/** The literal SLA-status chip text shown in the header card. */
export function slaChipTextFor(stage: Task['stage']): 'Met' | 'On Track' {
  return stage === 'Done' ? 'Met' : 'On Track';
}

export type DependencyReminderInput = Readonly<{
  blocking: boolean;
  category: string;
  dueDate: Date;
  id: string;
  status: string;
  type: string;
}>;

export type DependencyReminderItem = DependencyReminderInput &
  Readonly<{ workdaysLeft: number }>;

/**
 * Pending dependencies whose due date falls within the next `REMIND_WORKDAYS`
 * working days (or is already past), sorted soonest-first.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L17305-L17313 `depReminderItems`.
 */
export function dependencyReminderItems(
  dependencies: readonly DependencyReminderInput[],
  today: Date = new Date(),
): readonly DependencyReminderItem[] {
  const limit = addWorkdays(today, REMIND_WORKDAYS);
  return dependencies
    .filter((dependency) => dependency.status.toLowerCase() !== 'resolved')
    .filter((dependency) => dependency.dueDate <= limit)
    .map((dependency) => ({
      ...dependency,
      workdaysLeft: workdaysBetween(today, dependency.dueDate),
    }))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}
