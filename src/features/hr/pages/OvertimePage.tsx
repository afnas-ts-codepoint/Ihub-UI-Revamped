import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { OvertimeTable } from '../components/OvertimeTable';
import { overtimeStatusKeys } from '../domain/status';
import { useOvertime } from '../hooks/useOvertime';
import {
  createEmptyRecordFilter,
  RecordFilter,
  type RecordExportDefinition,
} from '@/features/organization';
import { StatTile } from '@/shared/ui/stat/StatTile';

/** @prototype index.html:L8285-L8462 */
export function OvertimePage() {
  const { t } = useTranslation('hr');
  const { rows, stats, tabs } = useOvertime();
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const exportDefinition: RecordExportDefinition = {
    columns: [
      t('columns.id'),
      t('columns.employee'),
      t('columns.department'),
      t('columns.date'),
      t('columns.hours'),
      t('columns.amount'),
      t('columns.status'),
    ],
    label: t('title'),
    rows: rows.map((row) => [
      row.id,
      row.employee,
      row.dept,
      row.date,
      String(row.hours),
      row.amount,
      t(`status.${overtimeStatusKeys[row.status]}`),
    ]),
  };

  return (
    <section className="flex flex-col gap-5">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-6">
        <h1 className="display m-0 text-10xl leading-[1.1] font-medium tracking-[-0.025em]">
          {t('title')}
        </h1>
      </header>
      <div className="mb-5 grid grid-cols-3 gap-3.5">
        {stats.map((stat) => (
          <StatTile
            key={stat.key}
            label={t(`stats.${stat.key}.label`)}
            sub={t(`stats.${stat.key}.sub`)}
            tone={stat.tone}
            value={t(`stats.${stat.key}.value`)}
          />
        ))}
      </div>
      <RecordFilter
        exportDefinition={exportDefinition}
        kind="budget"
        onChange={setFilter}
        value={filter}
      />
      <OvertimeTable rows={rows} tabs={tabs} />
    </section>
  );
}
