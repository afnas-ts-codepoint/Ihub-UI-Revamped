import { Outlet, useMatches } from 'react-router';

import { HomeTopBanner } from '../components/banner/HomeTopBanner';
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

  return (
    <div className="flex flex-col gap-6">
      <HomeTopBanner activeTab={activeTab} />
      <Outlet />
    </div>
  );
}
