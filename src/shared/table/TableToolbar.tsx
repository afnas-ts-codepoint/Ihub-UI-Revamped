import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

type TableToolbarProps = Readonly<{
  end?: ReactNode;
  middle?: ReactNode;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchValue: string;
}>;

/**
 * Generic table-toolbar layout: a search field, a middle slot (e.g. status
 * chips) and an end slot (e.g. filter/settings/export buttons). It owns only
 * presentation; every field's semantics stay with its feature.
 * @prototype index.html:L4894-L4917 (card wrapper at L4954-L4956)
 */
export function TableToolbar({
  end,
  middle,
  onSearchChange,
  searchPlaceholder,
  searchValue,
}: TableToolbarProps) {
  return (
    <div className="rounded-dialog border border-line bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex h-8 max-w-[200px] min-w-0 flex-[1_1_200px] items-center gap-2 rounded-menu border border-line-strong bg-canvas px-3">
          <Search aria-hidden="true" className="shrink-0 text-fg-4" size={15} />
          <input
            aria-label={searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg-3"
            onChange={(event) => {
              onSearchChange(event.target.value);
            }}
            placeholder={searchPlaceholder}
            value={searchValue}
          />
        </div>
        {middle}
        <div className="ms-auto flex flex-wrap items-center gap-2">{end}</div>
      </div>
    </div>
  );
}
