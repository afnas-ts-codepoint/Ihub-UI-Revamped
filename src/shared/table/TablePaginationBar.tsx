import { ArrowRight } from 'lucide-react';

type TablePaginationBarProps = Readonly<{
  entriesAriaLabel: string;
  entriesOptions: readonly string[];
  entriesUnitLabel: string;
  entriesValue: string;
  entriesValueLabel: (value: string) => string;
  nextLabel: string;
  onEntriesChange: (value: string) => void;
  onPageChange: (page: number) => void;
  page: number;
  pageLabel: string;
  previousLabel: string;
  showLabel: string;
  summary: string;
  totalPages: number;
}>;

/**
 * Functional replacement, for Masters only, of the inert `TablePagination`
 * used by M3 tables: a "Show N entries" picker plus real previous/page/next
 * navigation. @prototype index.html:L4789-L4809,L4986-L5011
 */
export function TablePaginationBar({
  entriesAriaLabel,
  entriesOptions,
  entriesUnitLabel,
  entriesValue,
  entriesValueLabel,
  nextLabel,
  onEntriesChange,
  onPageChange,
  page,
  pageLabel,
  previousLabel,
  showLabel,
  summary,
  totalPages,
}: TablePaginationBarProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5">
      <div className="flex flex-wrap items-center gap-3.5">
        <div className="flex shrink-0 items-center gap-2 text-2xs-plus text-fg-3">
          <span>{showLabel}</span>
          <select
            aria-label={entriesAriaLabel}
            className="h-[30px] cursor-pointer rounded-lg border border-line-strong bg-surface px-2.5 font-semibold text-fg"
            onChange={(event) => {
              onEntriesChange(event.target.value);
            }}
            value={entriesValue}
          >
            {entriesOptions.map((option) => (
              <option key={option} value={option}>
                {entriesValueLabel(option)}
              </option>
            ))}
          </select>
          <span>{entriesUnitLabel}</span>
        </div>
        <span className="text-2xs-plus text-fg-3">{summary}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          aria-label={previousLabel}
          className="rounded-lg px-2 py-1 text-fg-2 hover:bg-inset disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => {
            onPageChange(page - 1);
          }}
          type="button"
        >
          <ArrowRight aria-hidden="true" className="rotate-180" size={13} />
        </button>
        {pages.map((pageNumber) => (
          <button
            aria-current={pageNumber === page ? 'page' : undefined}
            aria-label={`${pageLabel} ${String(pageNumber)}`}
            className={
              pageNumber === page
                ? 'min-w-[30px] rounded-lg bg-accent px-1 py-1 text-xs-plus font-bold text-accent-ink'
                : 'min-w-[30px] rounded-lg border border-line-strong px-1 py-1 text-xs-plus font-medium text-fg-2'
            }
            key={pageNumber}
            onClick={() => {
              onPageChange(pageNumber);
            }}
            type="button"
          >
            {pageNumber}
          </button>
        ))}
        <button
          aria-label={nextLabel}
          className="rounded-lg px-2 py-1 text-fg-2 hover:bg-inset disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => {
            onPageChange(page + 1);
          }}
          type="button"
        >
          <ArrowRight aria-hidden="true" size={13} />
        </button>
      </div>
    </div>
  );
}
