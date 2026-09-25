import { Filter, X } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';

import {
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

type FilterDialogProps = PropsWithChildren<{
  description: string;
  footer: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
  closeLabel: string;
}>;

export function FilterDialog({
  children,
  closeLabel,
  description,
  footer,
  onOpenChange,
  open,
  title,
}: FilterDialogProps) {
  return (
    <DialogRoot onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-menu bg-accent-dim text-accent">
            <Filter aria-hidden="true" size={15} />
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-lg font-semibold text-fg">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-fg-3">
              {description}
            </DialogDescription>
          </div>
          <button
            aria-label={closeLabel}
            className="ms-auto flex h-[30px] w-[30px] items-center justify-center rounded-menu border border-line-strong bg-surface text-fg-3"
            onClick={() => { onOpenChange(false); }}
            type="button"
          >
            <X aria-hidden="true" size={14} />
          </button>
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
        {footer}
      </DialogContent>
    </DialogRoot>
  );
}
