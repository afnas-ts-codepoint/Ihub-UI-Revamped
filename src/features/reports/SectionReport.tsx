import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  createEmptyRecordFilter,
  RecordExport,
  RecordFilter,
  type RecordExportDefinition,
} from '@/features/organization';
import { reportDefinitionFor } from './data/report-definitions';
import type { ReportDefinition } from './report.types';
import { Select } from '@/shared/form/controls/Select';
import { Field } from '@/shared/form/field/Field';
import { useLocalizedText } from '@/shared/i18n/localized';
import { toast } from '@/shared/ui/feedback/Toaster';

const fallbackDefinition = (title: string): ReportDefinition => ({
  columns: ['Reference', 'Record', 'Action', 'User', 'Date'],
  kind: 'history',
  label: { en: title, ar: title },
  rows: [],
  totals: null,
});

type SectionReportProps = Readonly<{
  reportKey?: string;
  title: string;
}>;

/** @prototype index.html:L1729-L1801 */
export function SectionReport({ reportKey, title }: SectionReportProps) {
  const { t } = useTranslation('reports');
  const localize = useLocalizedText();
  const definition = reportDefinitionFor(reportKey) ?? fallbackDefinition(title);
  const label = localize(definition.label);
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const [format, setFormat] = useState('detailed');
  const [group, setGroup] = useState('');
  const exportDefinition: RecordExportDefinition = {
    columns: definition.columns,
    label: definition.label.en,
    rows: definition.rows,
  };

  return (
    <section className="flex flex-col gap-[18px]">
      <header>
        <p className="m-0 text-xs font-semibold tracking-wider text-fg-3 uppercase">
          {t('eyebrow')}
        </p>
        <h2 className="display mt-1.5 mb-1 text-4xl font-medium tracking-[-.01em] text-fg">
          {t('title', { section: label })}
        </h2>
        <p className="m-0 max-w-[560px] text-base text-fg-3">
          {t('description')}
        </p>
      </header>
      <RecordFilter
        kind={definition.kind}
        noExport
        onChange={setFilter}
        value={filter}
      />
      <div className="flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-[18px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
          <Field label={t('fields.format')}>
            <Select
              ariaLabel={t('fields.format')}
              onChange={setFormat}
              options={[
                { value: 'detailed', label: t('formats.detailed') },
                { value: 'summary', label: t('formats.summary') },
                { value: 'trend', label: t('formats.trend') },
              ]}
              value={format}
            />
          </Field>
          <Field label={t('fields.group')}>
            <Select
              ariaLabel={t('fields.group')}
              onChange={setGroup}
              options={['Location', 'Zone', 'Department', 'Status', 'Month'].map(
                (value) => ({ label: value, value }),
              )}
              placeholder={t('none')}
              value={group}
            />
          </Field>
          <Field label={t('fields.period')}>
            <Select
              ariaLabel={t('fields.period')}
              // PROTOTYPE-NOOP(D2): the prototype renders period options but never stores a selection.
              onChange={() => undefined}
              options={[
                'This week',
                'This month',
                'Last quarter',
                'Year to date',
                'Custom range',
              ].map((value) => ({ label: value, value }))}
              placeholder={t('lastThirtyDays')}
              value=""
            />
          </Field>
        </div>
        <hr className="m-0 border-0 border-t border-line" />
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-sm text-fg-3">{t('exportAs')}</span>
          <div className="ms-auto flex flex-wrap gap-2">
            <RecordExport
              definition={exportDefinition}
              kind={definition.kind}
              mode="report"
            />
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-semibold text-fg"
              // PROTOTYPE-NOOP(D2): the prototype only shows local success feedback.
              onClick={() => { toast(t('emailSuccess')); }}
              type="button"
            >
              <Mail aria-hidden="true" size={13} />
              {t('email')}
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-[18px] py-3.5">
          <span className="text-base font-semibold text-fg">{t('preview')}</span>
          <span className="text-sm text-fg-3">
            {t('rowCount', { count: definition.rows.length })}
          </span>
          {definition.totals ? (
            <span className="ms-auto rounded-full border border-line-strong bg-inset px-2 py-0.5 text-xs font-semibold text-fg-2">
              {definition.totals.label}{': '}{definition.totals.value}
            </span>
          ) : null}
        </div>
        {definition.rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {definition.columns.map((column) => (
                    <th
                      className="border-b border-line bg-inset px-3.5 py-[11px] text-start text-xs font-semibold tracking-wider whitespace-nowrap text-fg-3 uppercase"
                      key={column}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {definition.rows.map((row, rowIndex) => (
                  <tr key={row.join('|')}>
                    {row.map((cell, cellIndex) => (
                      <td
                        className={
                          cellIndex === 0
                            ? 'num border-b border-line px-3.5 py-[11px] text-sm-plus font-semibold whitespace-nowrap text-fg'
                            : 'border-b border-line px-3.5 py-[11px] text-sm-plus whitespace-nowrap text-fg-2'
                        }
                        key={`${String(rowIndex)}-${String(cellIndex)}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="m-0 p-[60px] text-center text-base text-fg-3">
            {t('empty')}
          </p>
        )}
      </div>
    </section>
  );
}
