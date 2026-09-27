import { Dialog as RadixDialog } from 'radix-ui';
import { Trash2, X } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

type ConfirmDialogProps = Readonly<{
  cancelLabel: string;
  closeLabel: string;
  confirmLabel: string;
  description: ReactNode;
  icon?: ComponentType<{ size?: number }>;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}>;

/**
 * Generic destructive-confirmation dialog, modeled on `MasterDeleteModal`'s
 * chrome: a circular danger icon, title, one sentence of body copy, and a
 * Cancel / danger-confirm pair right-aligned in the footer.
 * @prototype index.html:L4492-L4519
 */
export function ConfirmDialog({
  cancelLabel,
  closeLabel,
  confirmLabel,
  description,
  icon: Icon = Trash2,
  onConfirm,
  onOpenChange,
  open,
  title,
}: ConfirmDialogProps) {
  return (
    <RadixDialog.Root onOpenChange={onOpenChange} open={open}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[400] bg-fg/50" />
        <RadixDialog.Content className="fixed start-1/2 top-1/2 z-[401] w-[min(420px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 rounded-dialog bg-surface p-6 shadow-[0_24px_80px_rgba(26,26,31,0.4)] outline-none rtl:translate-x-1/2">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bad/15 text-bad">
                <Icon aria-hidden="true" size={20} />
              </span>
              <RadixDialog.Title className="text-lg-plus font-semibold text-fg">
                {title}
              </RadixDialog.Title>
            </div>
            <RadixDialog.Close
              aria-label={closeLabel}
              className="flex size-[30px] shrink-0 items-center justify-center rounded-lg text-fg-3 hover:bg-inset"
            >
              <X aria-hidden="true" size={15} />
            </RadixDialog.Close>
          </div>
          <RadixDialog.Description className="mb-5 text-base leading-[1.55] text-fg-2">
            {description}
          </RadixDialog.Description>
          <div className="flex justify-end gap-2.5">
            <RadixDialog.Close className="rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-2 hover:bg-inset">
              {cancelLabel}
            </RadixDialog.Close>
            <button
              className="text-white inline-flex items-center gap-1.5 rounded-lg bg-bad px-3 py-1.5 text-sm font-semibold"
              onClick={onConfirm}
              type="button"
            >
              <Trash2 aria-hidden="true" size={14} />
              {confirmLabel}
            </button>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
