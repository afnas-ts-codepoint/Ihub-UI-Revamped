import { useEffect } from 'react';
import { Outlet, useMatches } from 'react-router';

import { HomeQueueHost } from '../components/HomeQueueHost';
import { HomeTopBanner } from '../components/banner/HomeTopBanner';
import { useHomeQueueStore } from '../store/homeQueue.store';
import type { HomeTabId } from '../types/home.types';

function activeTabFromMatches(matches: ReturnType<typeof useMatches>) {
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index]?.handle as
      | Readonly<{ homeTab?: HomeTabId }>
      | undefined;
    if (handle?.homeTab) return handle.homeTab;
  }
  return null;
}

export function HomeLayout() {
  const activeTab = activeTabFromMatches(useMatches());

  // Queue state is local to the Home dashboard in the prototype (`DashboardOCC`):
  // leaving Home discards it, and the task-page banner shows the seed data.
  useEffect(
    () => () => {
      useHomeQueueStore.getState().reset();
    },
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <HomeTopBanner activeTab={activeTab} />
      <Outlet />
      <HomeQueueHost />
    </div>
  );
}
