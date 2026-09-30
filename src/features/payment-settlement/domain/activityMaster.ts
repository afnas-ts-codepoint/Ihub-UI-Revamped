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
