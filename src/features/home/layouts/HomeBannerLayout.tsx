import { Outlet } from 'react-router';

import { HomeTopBanner } from '../components/banner/HomeTopBanner';

/** Banner-only task frame: prototype renders the full tab row with no active tab. */
export function HomeBannerLayout() {
  return (
    <div className="flex flex-col gap-6">
      <HomeTopBanner activeTab={null} />
      <Outlet />
    </div>
  );
}
