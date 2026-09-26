import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChecklistTable } from '../components/ChecklistTable';
import { checklistStatusKeys } from '../domain/status';
import { useChecklists } from '../hooks/useChecklists';
import {
  createEmptyRecordFilter,
  RecordFilter,
  type RecordExportDefinition,
} from '@/features/organization';

/** @prototype index.html:L8570-L8660 ChecklistScreen */
export function ChecklistPage() {
  const { i18n, t } = useTranslation('checklists');
  const { rows, tabs } = useChecklists();
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const exportDefinition: RecordExportDefinition = {
    columns: [
      t('columns.id'),
      t('columns.title'),
      t('columns.site'),
      t('columns.submitted'),
      t('columns.by'),
      t('columns.progress'),
      t('columns.status'),
    ],
    label: t('title'),
    rows: rows.map((row) => [
      row.id,
      row.title,
      row.site,
      row.submitted,
      row.by,
      row.progress,
      t(`status.${checklistStatusKeys[row.status]}`),
    ]),
  };
  const isArabic = i18n.resolvedLanguage === 'ar';

  return (
    <section className="flex flex-col gap-5">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-6">
        <h1 className="display m-0 text-10xl leading-[1.1] font-medium tracking-[-0.025em]">
          {isArabic ? (
            t('title')
          ) : (
            <>
              {t('titleStart')}{' '}
              <em className="accent-em">{t('titleEmphasis')}</em>
            </>
          )}
        </h1>
      </header>
      <RecordFilter
        exportDefinition={exportDefinition}
        kind="sheet"
        onChange={setFilter}
        value={filter}
      />
      <ChecklistTable rows={rows} tabs={tabs} />
    </section>
  );
}
