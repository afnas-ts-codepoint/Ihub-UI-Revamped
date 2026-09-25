import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/app/layouts/app-shell/Logo';
import { MegaMenu } from '@/app/layouts/app-shell/MegaMenu';
import { MobileNavDrawer } from '@/app/layouts/app-shell/MobileNavDrawer';
import { navFirstLeaf } from '@/app/navigation/model';
import { NAV_TREE } from '@/app/navigation/nav.config';
import type { NavNode } from '@/app/navigation/types';
import { Icon } from '@/shared/ui/icon/Icon';

type TopNavProps = Readonly<{
  activeTrail: readonly NavNode[];
  onNavigate: (node: NavNode) => void;
}>;

export function TopNav({ activeTrail, onNavigate }: TopNavProps) {
  const { t } = useTranslation('nav');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeIds = new Set(activeTrail.map((node) => node.id));
  const topNavItems: readonly NavNode[] = NAV_TREE;

  return (
    <header className="border-b border-line bg-[color-mix(in_oklch,var(--bg)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-7 py-3 max-desktop:gap-3 max-desktop:px-3.5 max-desktop:py-2.5">
        <MobileNavDrawer
          activeTrail={activeTrail}
          onNavigate={onNavigate}
          onOpenChange={setDrawerOpen}
          open={drawerOpen}
        />
        <div className="max-phone:hidden">
          <Logo />
        </div>
        <div className="hidden max-phone:block">
          <Logo compact />
        </div>
        <nav
          aria-label={t('shell.primaryNavigation')}
          className="flex min-w-0 flex-1 gap-0.5 overflow-x-auto max-desktop:hidden"
        >
          {topNavItems.filter(
            (node) => !node.topbar && !node.hideInTopNav,
          ).map((node) =>
            node.megaMenu ? (
              <MegaMenu
                activeTrail={activeTrail}
                item={node}
                key={node.id}
                onNavigate={onNavigate}
              />
            ) : (
              <button
                aria-current={activeIds.has(node.id) ? 'page' : undefined}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-md font-medium whitespace-nowrap data-[active=true]:bg-inset data-[active=true]:text-fg data-[active=false]:text-fg-3"
                data-active={activeIds.has(node.id)}
                data-nav-id={node.id}
                key={node.id}
                onClick={() => {
                  onNavigate(
                    node.firstLeafRoute ? navFirstLeaf(node) : node,
                  );
                }}
                type="button"
              >
                {node.icon ? <Icon name={node.icon} size={15} /> : null}
                {t(node.labelKey, { defaultValue: node.id })}
              </button>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}
