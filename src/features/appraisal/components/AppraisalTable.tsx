import { useTranslation } from 'react-i18next';

import { scoreBand } from '../domain/scoreBand';
import type { Appraisal, AppraisalRating } from '../types/appraisal.types';
import { Chip } from '@/shared/ui/chip/Chip';
import { TabbedTable, type TableColumn } from '@/shared/table';

const ratingTones: Record<AppraisalRating, 'neutral' | 'ok' | 'warn'> = {
  Exceeds: 'ok',
  Meets: 'neutral',
  Improve: 'warn',
};

export function AppraisalTable({
  rows,
}: Readonly<{ rows: readonly Appraisal[] }>) {
  const { t } = useTranslation('appraisal');
  const columns: readonly TableColumn<Appraisal>[] = [
    { key: 'id', label: t('columns.id') },
    { key: 'employee', label: t('columns.employee') },
    { key: 'dept', label: t('columns.department'), muted: true },
    { key: 'period', label: t('columns.period'), muted: true },
    {
      key: 'score',
      label: t('columns.score'),
      align: 'end',
      render: (row) => (
        <span
          className="num font-semibold data-[band=bad]:text-bad data-[band=neutral]:text-fg data-[band=ok]:text-ok"
          data-band={scoreBand(row.score)}
        >
          {row.score.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'rating',
      label: t('columns.rating'),
      render: (row) => (
        <Chip
          className="px-[9px] py-0.5 text-xs"
          tone={ratingTones[row.rating]}
        >
          {t(`ratings.${row.rating}`)}
        </Chip>
      ),
    },
    { key: 'reviewer', label: t('columns.reviewer'), muted: true },
  ];

  return (
    <TabbedTable
      columns={columns}
      emptyDescription={t('empty.description')}
      emptyTitle={t('empty.title')}
      paginationLabels={{
        next: t('pagination.next'),
        page: t('pagination.page'),
        previous: t('pagination.previous'),
        summary: t('pagination.summary', {
          shown: rows.length,
          total: rows.length,
        }),
      }}
      rows={rows}
      tabs={[{ id: 'all', label: t('tabs.all'), count: rows.length }]}
    />
  );
}
