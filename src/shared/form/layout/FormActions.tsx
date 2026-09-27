import type { ReactNode } from 'react';

import { DialogFooter } from '@/shared/ui/overlay/Dialog';

type Props = Readonly<{
  cancelLabel: string;
  disabled?: boolean;
  message?: ReactNode;
  onCancel: () => void;
  submitLabel: string;
}>;

export function FormActions({ cancelLabel, disabled, message, onCancel, submitLabel }: Props) {
  return (
    <DialogFooter>
      <span className="text-xs-plus text-fg-3">{message}</span>
      <div className="ms-auto flex gap-2">
        <button
          className="rounded-lg px-3 py-2 text-sm font-semibold text-fg-2 hover:bg-canvas"
          onClick={onCancel}
          type="button"
        >
          {cancelLabel}
        </button>
        <button
          className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          type="submit"
        >
          {submitLabel}
        </button>
      </div>
    </DialogFooter>
  );
}
