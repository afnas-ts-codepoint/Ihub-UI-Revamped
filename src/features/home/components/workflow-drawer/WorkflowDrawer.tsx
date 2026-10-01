import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon, type IconName } from '@/shared/ui/icon/Icon';
import {
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
} from '@/shared/ui/overlay/Drawer';

import { useHomeQueueStore } from '../../store/homeQueue.store';
import type { DrawerState } from '../../types/queue.types';
import { ActionBody } from './ActionBody';
import {
  capitalise,
  DUE_CHIP_TONE,
  PRIORITY_CHIP_TONE,
  SEVERITY_TONE,
} from './drawerTones';
import { eyebrowClass } from './DrawerParts';
import { IncidentBody } from './IncidentBody';
import { JobOrderBody } from './JobOrderBody';

const EYEBROW_KEY = {
  action: 'drawer.eyebrow.action',
  incident: 'drawer.eyebrow.incident',
  jo: 'drawer.eyebrow.jobOrder',
} as const satisfies Record<DrawerState['type'], string>;

const chipSize = 'text-2xs';

function drawerIcon(drawer: DrawerState): IconName {
  // Job orders carry no icon; the prototype falls back to the inbox glyph.
  return drawer.type === 'jo' ? 'inbox' : drawer.item.icon;
}

function DrawerChips({ drawer }: Readonly<{ drawer: DrawerState }>) {
  if (drawer.type === 'incident') {
    const { item } = drawer;
    return (
      <>
        <span
          className={cn(
            'inline-flex items-center rounded-full border border-transparent px-2 py-0.5 font-semibold',
            chipSize,
            SEVERITY_TONE[item.severity].chip,
          )}
        >
          {capitalise(item.severity)}
        </span>
        <Chip className={chipSize}>{item.status}</Chip>
        <span className="num text-sm text-fg-4">{item.id}</span>
      </>
    );
  }
  const { item } = drawer;
  return (
    <>
      <Chip className={chipSize} tone={PRIORITY_CHIP_TONE[item.priority]}>
        {item.priority}
      </Chip>
      {drawer.type === 'action' ? (
        <Chip className={chipSize} tone={DUE_CHIP_TONE[drawer.item.dueState]}>
          {drawer.item.due}
        </Chip>
      ) : (
        <span className="num text-sm text-fg-4">{item.id}</span>
      )}
    </>
  );
}

function DrawerHeader({ drawer }: Readonly<{ drawer: DrawerState }>) {
  const { t } = useTranslation('homeWorkflow');
  const closeDrawer = useHomeQueueStore((state) => state.closeDrawer);
  const tile =
    drawer.type === 'incident'
      ? SEVERITY_TONE[drawer.item.severity].tile
      : 'bg-accent/[16%] text-accent';

  return (
    <header className="shrink-0 border-b border-line px-6 pt-5 pb-[18px]">
      <div className="mb-3.5 flex items-center justify-between">
        <span className={cn(eyebrowClass, 'flex items-center gap-2')}>
          {t(EYEBROW_KEY[drawer.type])}
        </span>
        {/* "Close (Esc)" is hard-coded English in the prototype; kept as an identical-in-both-locales key. */}
        <button
          aria-label={t('drawer.close')}
          className="flex rounded p-1.5 text-fg-2 hover:bg-raised hover:text-fg"
          onClick={closeDrawer}
          title={t('drawer.close')}
          type="button"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            'flex size-[42px] shrink-0 items-center justify-center rounded-[11px]',
            tile,
          )}
        >
          <Icon name={drawerIcon(drawer)} size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <DrawerTitle asChild>
            <h2 className="display m-0 text-3xl-plus leading-[1.2] font-medium tracking-[-0.02em]">
              {drawer.item.title}
            </h2>
          </DrawerTitle>
          <div className="mt-[9px] flex flex-wrap items-center gap-[7px]">
            <DrawerChips drawer={drawer} />
          </div>
        </div>
      </div>
    </header>
  );
}

function DrawerView({ drawer }: Readonly<{ drawer: DrawerState }>) {
  return (
    <>
      <DrawerHeader drawer={drawer} />
      {drawer.type === 'action' ? (
        <ActionBody item={drawer.item} verify={drawer.verify} />
      ) : null}
      {drawer.type === 'incident' ? <IncidentBody item={drawer.item} /> : null}
      {drawer.type === 'jo' ? <JobOrderBody item={drawer.item} /> : null}
    </>
  );
}

/**
 * Slide-out workflow drawer for an approval action, incident or job order.
 * Self-contained: it renders the `drawer` snapshot held by the home queue
 * store (which is deliberately never refreshed while open, so chips and the
 * Pin label go stale after escalate/pin exactly as in the prototype).
 *
 * Deviations (recorded): placed on the logical inline-end side (left in RTL;
 * the prototype is physically right-anchored in both), Escape/scrim/drag close
 * it through the shared Vaul drawer with dialog semantics and focus handling.
 * @prototype ihub/index.html:L13087-L13614 `WorkflowDrawer`; mounted at L12733-L12740
 */
export function WorkflowDrawer() {
  const drawer = useHomeQueueStore((state) => state.drawer);
  const closeDrawer = useHomeQueueStore((state) => state.closeDrawer);
  // Keep rendering the last snapshot while the exit animation plays.
  const [lastDrawer, setLastDrawer] = useState(drawer);
  if (drawer && drawer !== lastDrawer) setLastDrawer(drawer);
  const shown = drawer ?? lastDrawer;

  return (
    <DrawerRoot
      onOpenChange={(open) => {
        if (!open) closeDrawer();
      }}
      open={drawer !== null}
      side="inline-end"
    >
      <DrawerPortal>
        <DrawerOverlay data-testid="workflow-drawer-overlay" />
        <DrawerContent
          aria-describedby={undefined}
          className={cn(
            'w-[min(520px,94vw)] bg-canvas',
            // The shared content pins by logical start/end while vaul slides in from a physical side
            // (left in RTL). Pin to the inline end and put the border on the inner edge in both.
            'data-[vaul-drawer-direction=left]:start-auto data-[vaul-drawer-direction=left]:end-0 data-[vaul-drawer-direction=left]:border-s data-[vaul-drawer-direction=left]:border-e-0',
            'data-[vaul-drawer-direction=right]:end-0',
          )}
          data-testid="workflow-drawer"
        >
          {shown ? (
            <div
              className="flex min-h-0 flex-1 flex-col"
              inert={drawer === null}
            >
              <DrawerView drawer={shown} />
            </div>
          ) : null}
        </DrawerContent>
      </DrawerPortal>
    </DrawerRoot>
  );
}
