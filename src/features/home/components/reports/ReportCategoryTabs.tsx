import { useLocalizedText } from '@/shared/i18n/localized';

import type { HomeReportCategory } from '../../types/reports.types';

type ReportCategoryTabsProps = Readonly<{
  ariaLabel: string;
  categories: readonly HomeReportCategory[];
  onChange: (category: HomeReportCategory) => void;
  value: string;
}>;

/**
 * Horizontally scrolling underline tab strip for the report categories.
 * @prototype index.html:L14815-L14822 category tab buttons
 */
export function ReportCategoryTabs({
  ariaLabel,
  categories,
  onChange,
  value,
}: ReportCategoryTabsProps) {
  const localize = useLocalizedText();

  return (
    <div
      aria-label={ariaLabel}
      className="mb-3.5 flex gap-1 overflow-x-auto border-b border-line"
      role="group"
    >
      {categories.map((category) => {
        const active = category.id === value;
        return (
          <button
            aria-pressed={active}
            className={`-mb-px flex cursor-pointer items-center gap-[7px] border-b-2 bg-transparent px-[13px] pt-3 pb-[11px] text-md whitespace-nowrap ${
              active
                ? 'border-accent font-semibold text-fg'
                : 'border-transparent font-medium text-fg-3'
            }`}
            key={category.id}
            onClick={() => {
              onChange(category);
            }}
            type="button"
          >
            {localize(category.label)}
          </button>
        );
      })}
    </div>
  );
}
