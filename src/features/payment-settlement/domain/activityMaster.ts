import { activityMasterFixture } from '../data/activity-master.fixture';

/**
 * Feature-local derivation helpers mirroring the prototype's
 * `window.ACTIVITY_NAMES` / `SUBACTIVITIES_FOR` globals.
 * @prototype index.html:L10936-L10964
 */
export const activityNames = (): string[] =>
  activityMasterFixture.filter((activity) => activity.active).map((activity) => activity.name);

export const subActivitiesFor = (activityName: string): string[] => {
  const activity = activityMasterFixture.find((item) => item.name === activityName);
  if (!activity) return [];
  return activity.subs.filter((sub) => sub.active).map((sub) => sub.name);
};

/** @prototype index.html:L8823-L8827 `window.SUBACTIVITY_NAMES` (empty-master fallback not ported — the fixture is always populated). */
export const subActivityNames = (): string[] => {
  const out: string[] = [];
  activityMasterFixture.forEach((activity) => {
    activity.subs.forEach((sub) => {
      if (sub.active && !out.includes(sub.name)) out.push(sub.name);
    });
  });
  return out;
};

/** @prototype index.html:L7673 `SUBS_OF` — falls back to every sub-activity when the activity has none (or none is chosen). */
export const subActivitiesOrAll = (activityName: string): string[] => {
  const subs = subActivitiesFor(activityName);
  return subs.length ? subs : subActivityNames();
};
