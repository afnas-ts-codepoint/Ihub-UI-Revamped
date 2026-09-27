import { activityMasterFixture } from '../data/activity-master.fixture';

/**
 * Feature-local derivation helpers mirroring the prototype's
 * `window.ACTIVITY_NAMES` / `SUBACTIVITIES_FOR` / `SUBACTIVITY_NAMES` /
 * `ACTIVITY_AVAILABLE` / `SUB_BUDGET` globals. The prototype fallbacks that
 * only fire when `window.ACTIVITY_MASTER` is empty are not ported: this
 * feature-local fixture is always populated, so those branches are
 * unreachable, matching the "do not migrate dead code" rule.
 * @prototype index.html:L10936-L10964
 */
export const activityNames = (): string[] =>
  activityMasterFixture.filter((activity) => activity.active).map((activity) => activity.name);

export const subActivitiesFor = (activityName: string): string[] => {
  const activity = activityMasterFixture.find((item) => item.name === activityName);
  if (!activity) return [];
  return activity.subs.filter((sub) => sub.active).map((sub) => sub.name);
};

export const subActivityNames = (): string[] => {
  const out: string[] = [];
  activityMasterFixture.forEach((activity) => {
    activity.subs.forEach((sub) => {
      if (sub.active && !out.includes(sub.name)) out.push(sub.name);
    });
  });
  return out;
};

export const activityBudget = (activityName: string): number =>
  activityMasterFixture.find((activity) => activity.name === activityName)?.budget ?? 0;

export const activityCommitted = (activityName: string): number =>
  activityMasterFixture.find((activity) => activity.name === activityName)?.committed ?? 0;

export const activityAvailable = (activityName: string): number =>
  activityBudget(activityName) - activityCommitted(activityName);

export type SubActivityBudget = Readonly<{ alloc: number; available: number; committed: number }>;

export const subBudget = (activityName: string, subName: string): SubActivityBudget => {
  const activity = activityMasterFixture.find((item) => item.name === activityName);
  const sub = activity?.subs.find((item) => item.name === subName);
  if (!sub) return { alloc: 0, available: 0, committed: 0 };
  return { alloc: sub.alloc, available: sub.alloc - sub.committed, committed: sub.committed };
};
