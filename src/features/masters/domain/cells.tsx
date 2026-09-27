import { cn } from '@/shared/lib/cn';
import type { MasterCellContext, MasterRow } from './types';

type TextCellOptions = Readonly<{
  dash?: boolean;
  muted?: boolean;
  num?: boolean;
  strong?: boolean;
}>;

/** @prototype index.html:L4568-L4576 (`txtCell`) */
export function textCell(
  key: keyof MasterRow,
  options?: TextCellOptions,
): (row: MasterRow) => React.ReactNode {
  return (row) => {
    const value = row[key];
    const display =
      value === undefined || value === ''
        ? options?.dash
          ? '—'
          : ''
        : String(value);
    return (
      <span
        className={cn(
          options?.strong ? 'text-sm-plus font-medium' : 'text-base',
          options?.muted && 'text-fg-3',
          options?.num && 'num',
        )}
      >
        {display}
      </span>
    );
  };
}

/** @prototype index.html:L4577-L4591 (`statusCol`) */
export function statusCell(row: MasterRow, ctx: MasterCellContext) {
  const active = row.status === 'active';
  return (
    <button
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs leading-[1.45] font-medium',
        active ? 'chip-tone-ok' : 'border-line-strong bg-inset text-fg-2',
      )}
      onClick={() => {
        ctx.onToggleStatus(row.code);
      }}
      title={ctx.t(active ? 'toggle.setInactive' : 'toggle.setActive')}
      type="button"
    >
      {ctx.t(active ? 'chips.active' : 'chips.inactive')}
    </button>
  );
}
