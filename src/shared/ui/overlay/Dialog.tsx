import { Dialog as RadixDialog } from 'radix-ui';
import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react';

import { cn } from '@/shared/lib/cn';

export const DialogRoot = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;
export const DialogTitle = RadixDialog.Title;
export const DialogDescription = RadixDialog.Description;

export function DialogContent({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof RadixDialog.Content>) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-[400] bg-fg/50" />
      <RadixDialog.Content
        className={cn(
          'fixed start-1/2 top-1/2 z-[401] flex max-h-[86vh] w-[min(760px,calc(100%-48px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-[0_30px_80px_rgba(20,20,30,.30)] outline-none rtl:translate-x-1/2',
          className,
        )}
        {...props}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <header
      className={cn(
        'flex items-center gap-3 border-b border-line px-[22px] py-[18px]',
        className,
      )}
    >
      {children}
    </header>
  );
}

export function DialogBody({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('flex flex-col gap-5 overflow-y-auto p-[22px]', className)}>
      {children}
    </div>
  );
}

export function DialogFooter({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <footer
      className={cn(
        'flex flex-wrap items-center gap-2.5 border-t border-line bg-inset px-[22px] py-3.5',
        className,
      )}
    >
      {children}
    </footer>
  );
}
