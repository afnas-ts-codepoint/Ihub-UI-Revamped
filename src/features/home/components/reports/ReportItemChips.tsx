import { useLocalizedText } from '@/shared/i18n/localized';

import type { HomeReportItem } from '../../types/reports.types';

type ReportItemChipsProps = Readonly<{
  items: readonly HomeReportItem[];
  onChange: (id: string) => void;
  value: string;
}>;

/**
 * Single-select segmented chips for the reports of the active category (the
 * prototype's `FilterChips` `segmented` variant, which has no other consumer
 * here).
 * @prototype index.html:L12602-L12624 `FilterChips` (segmented)
 */
export function ReportItemChips({ items, onChange, value }: ReportItemChipsProps) {
  const localize = useLocalizedText();

  return (
    <div className="mb-4 flex">
      <div className="inline-flex flex-wrap gap-0.5 rounded-lg border border-line bg-inset p-[3px]">
        {items.map((item) => {
          const active = item.id === value;
          return (
            <button
              aria-pressed={active}
              className={`flex cursor-pointer items-center gap-1.5 rounded-compact px-3 py-1.5 text-base whitespace-nowrap ${
                active
                  ? 'bg-surface font-semibold text-accent shadow-segment'
                  : 'bg-transparent font-medium text-fg-2'
              }`}
              key={item.id}
              onClick={() => {
                onChange(item.id);
              }}
              type="button"
            >
              {localize(item.label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
