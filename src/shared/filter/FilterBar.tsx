import { Filter, Search, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { AppliedFilterChips } from '@/shared/filter/AppliedFilterChips';
import type { AppliedFilter } from '@/shared/filter/filter.types';
import { cn } from '@/shared/lib/cn';

type FilterBarProps = Readonly<{
  activeCount: number;
  appliedFilters: readonly AppliedFilter[];
  appliedLabel: string;
  bare?: boolean;
  clearAllLabel: string;
  exportSlot?: ReactNode;
  filterLabel: string;
  hideChips?: boolean;
  midActions?: ReactNode;
  noMargin?: boolean;
  onClear: () => void;
  onOpen: () => void;
  onSearchChange: (value: string) => void;
  removeLabel: string;
  searchPlaceholder: string;
  searchValue: string;
}>;

export function FilterBar({
  activeCount,
  appliedFilters,
  appliedLabel,
  bare,
  clearAllLabel,
  exportSlot,
  filterLabel,
  hideChips,
  midActions,
  noMargin,
  onClear,
  onOpen,
  onSearchChange,
  removeLabel,
  searchPlaceholder,
  searchValue,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2.5',
        !bare && 'rounded-xl border border-line bg-surface p-3.5',
        !bare && !noMargin && 'mb-[18px]',
      )}
    >
      <div className="flex min-w-[220px] flex-[1_1_260px] items-center gap-2 rounded-menu border border-line-strong bg-canvas px-3">
        <Search aria-hidden="true" className="shrink-0 text-fg-4" size={14} />
        <input
          aria-label={searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-fg outline-none placeholder:text-fg-3"
          onChange={(event) => { onSearchChange(event.target.value); }}
          placeholder={searchPlaceholder}
          value={searchValue}
        />
      </div>
      <button
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold',
          activeCount
            ? 'border border-line-strong bg-surface text-fg'
            : 'text-fg-2 hover:bg-inset',
        )}
        onClick={onOpen}
        type="button"
      >
        <Filter aria-hidden="true" size={13} />
        <span>{filterLabel}</span>
        {activeCount ? (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-ink">
            {activeCount}
          </span>
        ) : null}
      </button>
      {midActions}
      {exportSlot}
      {!hideChips && activeCount ? (
        <button
          className="inline-flex items-center gap-1 rounded-lg border border-bad/30 px-3 py-1.5 text-sm font-semibold text-bad"
          onClick={onClear}
          type="button"
        >
          <X aria-hidden="true" size={12} />
          <span>{clearAllLabel}</span>
        </button>
      ) : null}
      {!hideChips ? (
        <AppliedFilterChips
          clearLabel={clearAllLabel}
          filters={appliedFilters}
          onClear={onClear}
          removeLabel={removeLabel}
          title={appliedLabel}
        />
      ) : null}
    </div>
  );
}
