import { CalendarDays, ChevronDown, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const fields = [
  { id: 'from', type: 'date' },
  { id: 'to', type: 'date' },
  { id: 'department', type: 'select' },
  { id: 'site', type: 'select' },
] as const;

/**
 * @prototype index.html:L7947-L8069, L9709-L9711
 * M3.9 reconciliation: Reports is the only real consumer, so this stays feature-local.
 */
export function FilterForm() {
  const { t } = useTranslation('reports');

  return (
    <section
      aria-label={t('library.filterFormLabel')}
      className="mb-5 rounded-xl border border-line bg-surface p-[22px]"
      data-testid="reports-filter-form"
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3.5">
        {fields.map((field) => (
          <div className="flex flex-col gap-1.5" key={field.id}>
            <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
              {t(`library.filters.${field.id}.label`)}
            </span>
            <div
              aria-disabled="true"
              className="flex items-center gap-2 rounded-menu border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg-2"
              data-testid={`reports-filter-${field.id}`}
            >
              {field.type === 'date' ? (
                <CalendarDays aria-hidden="true" size={14} />
              ) : null}
              <span className="min-w-0 flex-1 truncate">
                {t(`library.filters.${field.id}.placeholder`)}
              </span>
              {field.type === 'select' ? (
                <ChevronDown aria-hidden="true" size={14} />
              ) : null}
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
            {t('library.filters.type.label')}
          </span>
          <div className="flex gap-1.5">
            {(['summary', 'detailed'] as const).map((option) => (
              <button
                aria-pressed={option === 'summary'}
                className="flex-1 rounded-menu border px-2.5 py-2.5 text-base font-medium data-[active=false]:border-line-strong data-[active=false]:bg-canvas data-[active=false]:text-fg-2 data-[active=true]:border-accent data-[active=true]:bg-accent-dim data-[active=true]:text-accent"
                data-active={option === 'summary'}
                key={option}
                // PROTOTYPE-NOOP(D2): the standalone prototype renders inert type choices.
                onClick={() => undefined}
                type="button"
              >
                {t(`library.filters.type.${option}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3.5">
        <button
          className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-semibold text-fg"
          // PROTOTYPE-NOOP(D2): Cancel has no callback in ReportsScreen.
          onClick={() => undefined}
          type="button"
        >
          {t('library.filters.cancel')}
        </button>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg bg-interactive px-3 py-2 text-sm font-semibold text-accent-ink"
          // PROTOTYPE-NOOP(D2): Search has no callback and never replaces the placeholder.
          onClick={() => undefined}
          type="button"
        >
          <Search aria-hidden="true" size={14} />
          {t('library.filters.search')}
        </button>
      </div>
    </section>
  );
}
