import type { ComponentType } from 'react';

import { cn } from '@/shared/lib/cn';

export type RowAction = Readonly<{
  disabled?: boolean;
  icon: ComponentType<{ size?: number }>;
  key: string;
  label: string;
  onClick: () => void;
  tone?: 'danger';
}>;

/**
 * Generic inline icon-button row actions. The prototype's Master listing
 * renders View/Edit/Delete as plain icon buttons in the row, not a menu, so
 * this stays a row of buttons rather than a `DropdownMenu`.
 * @prototype index.html:L4757-L4766,L4976-L4980
 */
export function RowActions({ actions }: { actions: readonly RowAction[] }) {
  return (
    <div className="inline-flex items-center gap-1">
      {actions.map((action) => (
        <button
          aria-label={action.label}
          className={cn(
            'flex size-7 items-center justify-center rounded-lg text-fg-3 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50',
            action.tone === 'danger' && 'text-bad',
          )}
          disabled={action.disabled}
          key={action.key}
          onClick={action.onClick}
          title={action.label}
          type="button"
        >
          <action.icon size={15} />
        </button>
      ))}
    </div>
  );
}
