import { CheckCircle2, Trash2, XCircle } from 'lucide-react';
import type { TFunction } from 'i18next';

type BulkActionsBarProps = Readonly<{
  onClearSelection: () => void;
  onDeleteAll: () => void;
  onSetStatus: (status: 'active' | 'inactive') => void;
  selectedCount: number;
  t: TFunction<'masters'>;
}>;

/**
 * The selection toolbar that appears once at least one row is picked:
 * bulk Active / Inactive / Delete all, plus a Clear-selection link.
 * @prototype index.html:L4840-L4857
 */
export function BulkActionsBar({
  onClearSelection,
  onDeleteAll,
  onSetStatus,
  selectedCount,
  t,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="relative mt-3.5 flex flex-wrap items-center gap-3.5 rounded-lg border border-accent/25 bg-accent-dim py-3 ps-4.5 pe-4">
      <span className="absolute inset-y-2 inset-s-0 w-0.75 rounded-full bg-accent" />
      <span className="text-sm-plus font-semibold text-accent">
        {t(
          selectedCount === 1
            ? 'bulk.recordSelectedOne'
            : 'bulk.recordSelectedOther',
          { count: selectedCount },
        )}
      </span>
      <div className="ms-auto flex flex-wrap gap-2">
        <button
          className="rounded-md inline-flex h-8 items-center gap-1.5 border border-ok/40 bg-surface px-3.5 text-sm font-medium text-ok"
          data-testid="bulk-set-active"
          onClick={() => {
            onSetStatus('active');
          }}
          type="button"
        >
          <CheckCircle2 aria-hidden="true" size={13} />
          {t('bulk.active')}
        </button>
        <button
          className="rounded-md inline-flex h-8 items-center gap-1.5 border border-line-strong bg-surface px-3.5 text-sm font-medium text-fg-2"
          data-testid="bulk-set-inactive"
          onClick={() => {
            onSetStatus('inactive');
          }}
          type="button"
        >
          <XCircle aria-hidden="true" size={13} />
          {t('bulk.inactive')}
        </button>
        <button
          className="rounded-md inline-flex h-8 items-center gap-1.5 border border-bad/40 bg-surface px-3.5 text-sm font-medium text-bad"
          data-testid="bulk-delete-all"
          onClick={onDeleteAll}
          type="button"
        >
          <Trash2 aria-hidden="true" size={13} />
          {t('bulk.deleteAll')}
        </button>
      </div>
      <button
        className="text-xs-plus font-medium text-fg-3 underline"
        onClick={onClearSelection}
        type="button"
      >
        {t('bulk.clearSelection')}
      </button>
    </div>
  );
}
