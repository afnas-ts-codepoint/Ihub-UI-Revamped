import { Collapsible as RadixCollapsible } from 'radix-ui';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

type CollapsibleCardProps = Readonly<{
  actions?: ReactNode;
  badges?: ReactNode;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: ReactNode;
}>;

/** Small controlled accordion-card primitive introduced for M6.5. */
export function CollapsibleCard({ actions, badges, children, onOpenChange, open, title }: CollapsibleCardProps) {
  return (
    <RadixCollapsible.Root className="overflow-hidden rounded-xl border border-line bg-surface" onOpenChange={onOpenChange} open={open}>
      <div className={cn('flex items-center justify-between gap-3 bg-raised px-4 py-[13px]', open && 'border-b border-line')}>
        <RadixCollapsible.Trigger className="flex min-w-0 flex-1 items-center gap-2.5 text-start" type="button">
          <ChevronRight aria-hidden="true" className={cn('shrink-0 text-fg-4 transition-transform duration-150', open && 'rotate-90')} size={15} />
          <span className="shrink-0 text-sm-plus font-semibold tracking-[-0.01em]">{title}</span>
          {badges == null ? null : <span className="flex min-w-0 flex-wrap items-center gap-1.5">{badges}</span>}
        </RadixCollapsible.Trigger>
        {actions}
      </div>
      <RadixCollapsible.Content>{children}</RadixCollapsible.Content>
    </RadixCollapsible.Root>
  );
}
