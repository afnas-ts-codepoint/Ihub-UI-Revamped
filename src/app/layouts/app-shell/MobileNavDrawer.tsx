import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { NavNode } from '@/app/navigation/types';
import { NAV_TREE } from '@/app/navigation/nav.config';
import { Logo } from '@/app/layouts/app-shell/Logo';
import { NavTreeList } from '@/app/layouts/app-shell/NavTreeList';
import {
  DrawerClose,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/overlay/Drawer';
import { Icon } from '@/shared/ui/icon/Icon';

type MobileNavDrawerProps = Readonly<{
  activeTrail: readonly NavNode[];
  onNavigate: (node: NavNode) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}>;

export function MobileNavDrawer({
  activeTrail,
  onNavigate,
  onOpenChange,
  open,
}: MobileNavDrawerProps) {
  const { t } = useTranslation('nav');
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <DrawerRoot onOpenChange={onOpenChange} open={open} side="inline-start">
      <DrawerTrigger asChild>
        <button
          aria-label={t('shell.menu')}
          className="hidden size-9 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-surface text-fg-2 max-desktop:flex"
          data-testid="mobile-nav-trigger"
          ref={trigger}
          type="button"
        >
          <Icon name="menu" size={18} />
        </button>
      </DrawerTrigger>
      <DrawerPortal>
        <DrawerOverlay data-testid="mobile-nav-overlay" />
        <DrawerContent aria-describedby={undefined}>
          <div className="flex shrink-0 items-center justify-between gap-2.5 border-b border-line px-3.5 py-3">
            <DrawerTitle asChild>
              <div>
                <Logo />
              </div>
            </DrawerTitle>
            <DrawerClose asChild>
              <button
                aria-label={t('shell.close')}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-fg-2 hover:bg-inset"
                type="button"
              >
                <Icon name="close" size={16} />
              </button>
            </DrawerClose>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
            <NavTreeList
              activeTrail={activeTrail}
              items={NAV_TREE}
              key={activeTrail.map((node) => node.id).join('/')}
              onNavigate={(node) => {
                onNavigate(node);
                if (!node.children?.length) onOpenChange(false);
              }}
            />
          </nav>
        </DrawerContent>
      </DrawerPortal>
    </DrawerRoot>
  );
}
