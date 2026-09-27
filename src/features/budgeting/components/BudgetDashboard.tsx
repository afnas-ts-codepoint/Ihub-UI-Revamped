import { useTranslation } from 'react-i18next';

import { BudgetSectionHeading } from './BudgetSectionHeading';
import { BudgetStatRow } from './BudgetStatRow';
import { BarChart, type BarChartDatum } from '@/shared/ui/charts/BarChart';

export function BudgetDashboard({
  chart,
}: Readonly<{ chart: readonly BarChartDatum[] }>) {
  const { t } = useTranslation('budgeting');

  return (
    <>
      <BudgetStatRow
        stats={[
          { label: t('dashboard.stats.total'), value: 'KWD 8.4M' },
          { label: t('dashboard.stats.committed'), value: 'KWD 6.5M' },
          {
            label: t('dashboard.stats.available'),
            tone: 'ok',
            value: 'KWD 1.9M',
          },
          { label: t('dashboard.stats.pending'), value: '12' },
        ]}
      />
      <div className="mt-4 rounded-xl border border-line bg-surface p-[26px]">
        <BudgetSectionHeading
          subtitle={t('dashboard.chart.subtitle')}
          title={t('dashboard.chart.title')}
        />
        <BarChart ariaLabel={t('dashboard.chart.ariaLabel')} data={chart} />
      </div>
    </>
  );
}
