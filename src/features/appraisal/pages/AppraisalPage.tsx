import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppraisalTable } from '../components/AppraisalTable';
import { useAppraisals } from '../hooks/useAppraisals';
import {
  createEmptyRecordFilter,
  RecordFilter,
  type RecordExportDefinition,
} from '@/features/organization';

export function AppraisalPage() {
  const { t } = useTranslation('appraisal');
  const { data } = useAppraisals();
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const exportDefinition: RecordExportDefinition = {
    columns: [
      t('columns.id'),
      t('columns.employee'),
      t('columns.department'),
      t('columns.period'),
      t('columns.score'),
      t('columns.rating'),
      t('columns.reviewer'),
    ],
    label: t('title'),
    rows: data.map((row) => [
      row.id,
      row.employee,
      row.dept,
      row.period,
      row.score.toFixed(1),
      t(`ratings.${row.rating}`),
      row.reviewer,
    ]),
  };

  return (
    <section className="flex flex-col gap-5">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-6">
        <h1 className="display m-0 text-10xl leading-[1.1] font-medium tracking-[-0.025em]">
          {t('title')}
        </h1>
      </header>
      <RecordFilter
        exportDefinition={exportDefinition}
        kind="task"
        onChange={setFilter}
        value={filter}
      />
      <AppraisalTable rows={data} />
    </section>
  );
}
