import { X } from 'lucide-react';

import type { AppliedFilter } from '@/shared/filter/filter.types';
import { Chip } from '@/shared/ui/chip/Chip';

type AppliedFilterChipsProps = Readonly<{
  filters: readonly AppliedFilter[];
  onClear: () => void;
  removeLabel: string;
  title: string;
  clearLabel: string;
}>;

export function AppliedFilterChips({
  clearLabel,
  filters,
  onClear,
  removeLabel,
  title,
}: AppliedFilterChipsProps) {
  if (!filters.length) return null;

  return (
    <div className="flex basis-full flex-wrap items-center gap-1.5 border-t border-line pt-1">
      <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
        {title}
      </span>
      {filters.map((filter) => (
        <Chip className="max-w-[260px] gap-1.5 py-1 ps-2.5 pe-1.5" key={filter.id}>
          <span className="text-xs font-semibold tracking-wide text-fg-3 uppercase">
            {filter.label}
          </span>
          <span className="truncate text-fg">{filter.value}</span>
          <button
            aria-label={`${removeLabel}: ${filter.value}`}
            className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-fg-3"
            onClick={filter.onRemove}
            type="button"
          >
            <X aria-hidden="true" size={11} />
          </button>
        </Chip>
      ))}
      <button
        className="px-1 py-0.5 text-sm font-semibold text-accent"
        onClick={onClear}
        type="button"
      >
        {clearLabel}
      </button>
    </div>
  );
}
