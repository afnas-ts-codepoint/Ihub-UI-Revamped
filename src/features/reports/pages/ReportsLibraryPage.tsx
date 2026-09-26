import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterForm } from '../components/FilterForm';
import {
  DEFAULT_REPORT_LIBRARY_GROUP,
  DEFAULT_REPORT_LIBRARY_REPORT,
  REPORT_LIBRARY_CATALOGUE,
  reportsForLibraryGroup,
} from '../constants/reports-library';
import {
  REPORT_LIBRARY_GROUPS,
  type ReportLibraryGroup,
} from '../types/reports-library.types';
import { RecordExport } from '@/features/organization';
import { normalizeLocale } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';

/** @prototype index.html:L9609-L9725 */
export function ReportsLibraryPage() {
  const { i18n, t } = useTranslation('reports');
  const locale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);
  const [activeGroup, setActiveGroup] = useState<ReportLibraryGroup>(
    DEFAULT_REPORT_LIBRARY_GROUP,
  );
  const [pickedId, setPickedId] = useState<string>(
    DEFAULT_REPORT_LIBRARY_REPORT.id,
  );
  const visibleReports = reportsForLibraryGroup(activeGroup);
  const picked =
    REPORT_LIBRARY_CATALOGUE.find((report) => report.id === pickedId) ??
    DEFAULT_REPORT_LIBRARY_REPORT;

  const pickGroup = (group: ReportLibraryGroup) => {
    setActiveGroup(group);
    const first = reportsForLibraryGroup(group)[0];
    if (first) setPickedId(first.id);
  };

  return (
    <section className="rise">
      <div className="mb-7">
        <h1 className="display m-0 text-[34px] leading-[1.1] font-medium tracking-[-0.025em] text-fg">
          {locale === 'ar' ? (
            t('library.title')
          ) : (
            <>
              {t('library.titleStart')}{' '}
              <em className="accent-em">{t('library.titleEmphasis')}</em>
            </>
          )}
        </h1>
      </div>

      <nav aria-label={t('library.groupNavigation')} className="mb-[18px]">
        <div className="mb-3.5 flex gap-1 overflow-x-auto border-b border-line">
          {REPORT_LIBRARY_GROUPS.map((group) => {
            const active = group === activeGroup;
            return (
              <button
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'mb-[-1px] border-b-2 px-[13px] pt-3 pb-[11px] text-base whitespace-nowrap',
                  active
                    ? 'border-accent font-semibold text-fg'
                    : 'border-transparent font-medium text-fg-3',
                )}
                key={group}
                onClick={() => {
                  pickGroup(group);
                }}
                type="button"
              >
                {group}
              </button>
            );
          })}
        </div>
        <div className="inline-flex max-w-full flex-wrap gap-0.5 rounded-menu bg-inset p-0.5">
          {visibleReports.map((report) => {
            const active = report.id === pickedId;
            return (
              <button
                aria-pressed={active}
                className="rounded-compact px-[13px] py-1.5 text-sm-plus font-medium whitespace-nowrap text-fg-2 data-[active=true]:bg-surface data-[active=true]:font-semibold data-[active=true]:text-accent data-[active=true]:shadow-segment"
                data-active={active}
                key={report.id}
                onClick={() => {
                  setPickedId(report.id);
                }}
                type="button"
              >
                {report.label}
              </button>
            );
          })}
        </div>
      </nav>

      <FilterForm />

      <section className="rounded-xl border border-line bg-surface p-[22px]">
        <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow mb-1.5 text-xs font-semibold tracking-wider text-fg-3 uppercase">
              {picked.group}
            </p>
            <h2 className="display m-0 text-[22px] font-medium tracking-[-0.01em] text-fg">
              {picked.label}
            </h2>
          </div>
          <div className="[&>button]:bg-interactive [&>button]:text-accent-ink">
            <RecordExport
              compact
              definition={{
                columns: ['Reference', 'Record', 'Date', 'Status'],
                label: picked.label,
                rows: [],
              }}
              kind="history"
            />
          </div>
        </div>
        <div
          className="rounded-menu border border-dashed border-line-strong bg-canvas p-[60px] text-center text-sm-plus text-fg-3 max-phone:px-4 max-phone:py-10"
          data-testid="reports-preview-placeholder"
        >
          {t('library.previewPlaceholder')}
        </div>
      </section>
    </section>
  );
}
