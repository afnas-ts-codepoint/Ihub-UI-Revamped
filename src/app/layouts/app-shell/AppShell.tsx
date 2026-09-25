import { Outlet, useLocation, useNavigate } from 'react-router';

import { SecondaryNav } from '@/app/layouts/app-shell/SecondaryNav';
import { TopNav } from '@/app/layouts/app-shell/TopNav';
import { navTrailForPath } from '@/app/navigation/model';
import { NAV_TREE } from '@/app/navigation/nav.config';
import type { NavNode } from '@/app/navigation/types';

/** @prototype index.html:L5180-L5192 Shell top-navigation branch. */
export function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeTrail = navTrailForPath(NAV_TREE, pathname);
  const handleNavigate = (node: NavNode) => void navigate(node.path);

  return (
    <div className="min-h-screen bg-canvas">
      <div className="sticky top-0 z-30">
        <TopNav activeTrail={activeTrail} onNavigate={handleNavigate} />
        <SecondaryNav activeTrail={activeTrail} onNavigate={handleNavigate} />
      </div>
      <main className="mx-auto max-w-[1440px] px-7 pt-7 pb-[60px]">
        <Outlet />
      </main>
    </div>
  );
}
