type TablePaginationProps = Readonly<{
  labels: Readonly<{
    next: string;
    page: string;
    previous: string;
    summary: string;
  }>;
}>;

/** @prototype index.html:L8181-L8226 */
export function TablePagination({ labels }: TablePaginationProps) {
  const pages = [1, 2, 3] as const;

  return (
    <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-fg-3">
      <span>{labels.summary}</span>
      <div className="flex gap-1">
        {/* PROTOTYPE-NOOP(D2): these controls intentionally do not change pages. */}
        <button
          aria-label={labels.previous}
          className="rounded-lg px-[9px] py-1 hover:bg-inset"
          type="button"
        >
          {'‹'}
        </button>
        {pages.map((page) => (
          <button
            aria-current={page === 1 ? 'page' : undefined}
            aria-label={`${labels.page} ${String(page)}`}
            className={
              page === 1
                ? 'rounded-lg border border-line-strong bg-surface px-[9px] py-1 font-medium'
                : 'rounded-lg px-[9px] py-1 hover:bg-inset'
            }
            key={page}
            type="button"
          >
            {page}
          </button>
        ))}
        <button
          aria-label={labels.next}
          className="rounded-lg px-[9px] py-1 hover:bg-inset"
          type="button"
        >
          {'›'}
        </button>
      </div>
    </div>
  );
}
