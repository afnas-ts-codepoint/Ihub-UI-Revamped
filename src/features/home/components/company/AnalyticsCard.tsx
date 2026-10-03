import { useTranslation } from 'react-i18next';

import { BarChart } from '@/shared/ui/charts/BarChart';
import { Chip } from '@/shared/ui/chip/Chip';

import {
  ANALYTICS_MONTHLY_SERIES,
  ANALYTICS_STATS,
} from '../../data/company.mock';
import { HomeSectionHead } from '../sections/HomeSectionHead';

/**
 * Quarter revenue, headcount and NPS with a twelve-month bar chart. All
 * figures are fixed prototype fixtures.
 * @prototype index.html:L14049-L14052 `AnalyticsCard`
 */
export function AnalyticsCard() {
  const { t } = useTranslation('home');

  return (
    <div className="rounded-lg border border-line bg-surface p-[26px]">
      <HomeSectionHead
        right={<Chip tone="ok">{t('company.analytics.onTrack')}</Chip>}
        sub={t('company.analytics.subtitle')}
        title={t('company.analytics.title')}
      />
      <div className="mb-[22px] grid grid-cols-3 gap-5">
        {ANALYTICS_STATS.map((stat) => (
          <div key={stat.labelKey}>
            <div className="mb-1.5 text-sm font-medium tracking-[0.16em] text-fg-3 uppercase">
              {t(stat.labelKey)}
            </div>
            <div className="display num text-7xl font-medium tracking-[-0.02em]">
              {stat.value}
            </div>
            <div
              className={`num mt-0.5 text-sm font-semibold ${stat.tone === 'ok' ? 'text-ok' : 'text-fg-3'}`}
            >
              {stat.note}
            </div>
          </div>
        ))}
      </div>
      <BarChart
        ariaLabel={t('company.analytics.chartLabel')}
        data={ANALYTICS_MONTHLY_SERIES}
        height={110}
      />
    </div>
  );
}
