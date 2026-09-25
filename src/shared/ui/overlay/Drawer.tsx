import { Drawer as VaulDrawer } from 'vaul';
import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react';

import { cn } from '@/shared/lib/cn';
import { useDirection } from '@/shared/i18n/useDirection';

type DrawerRootProps = PropsWithChildren<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'inline-start' | 'inline-end';
}>;

export function DrawerRoot({
  children,
  onOpenChange,
  open,
  side = 'inline-end',
}: DrawerRootProps) {
  const direction = useDirection();
  const isStart = side === 'inline-start';
  const vaulDirection =
    direction === 'ltr' === isStart ? 'left' : ('right' as const);

  return (
    <VaulDrawer.Root
      direction={vaulDirection}
      dismissible
      onOpenChange={onOpenChange}
      open={open}
      shouldScaleBackground={false}
    >
      {children}
    </VaulDrawer.Root>
  );
}

export const DrawerTrigger = VaulDrawer.Trigger;
export const DrawerClose = VaulDrawer.Close;
export const DrawerTitle = VaulDrawer.Title;

export function DrawerPortal({ children }: PropsWithChildren) {
  return <VaulDrawer.Portal>{children}</VaulDrawer.Portal>;
}

export function DrawerOverlay({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof VaulDrawer.Overlay>) {
  return (
    <VaulDrawer.Overlay
      className={cn(
        'fixed inset-0 z-[200] bg-fg/50 backdrop-blur-[2px]',
        className,
      )}
      {...props}
    />
  );
}

export function DrawerContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof VaulDrawer.Content>) {
  return (
    <VaulDrawer.Content
      className={cn(
        'fixed inset-y-0 z-[201] flex w-[min(300px,86vw)] flex-col border-line bg-surface shadow-drawer outline-none data-[vaul-drawer-direction=left]:start-0 data-[vaul-drawer-direction=left]:border-e data-[vaul-drawer-direction=right]:end-0 data-[vaul-drawer-direction=right]:border-s',
        className,
      )}
      {...props}
    />
  );
}
