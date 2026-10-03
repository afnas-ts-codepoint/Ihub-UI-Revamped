import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { loadWorkloadHeatmap, WORKLOAD_LEGEND } from '@/features/tasks';

import { HomeSectionHead } from '../sections/HomeSectionHead';

const WorkloadHeatmap = lazy(async () => ({
  default: await loadWorkloadHeatmap(),
}));

/**
 * Department / employee workload heatmap. It is the Tasks dashboard's
 * heatmap (M8.2) in its plain variant — the Overview does not pass the
 * dashboard's `soft` flag — under the Overview's own heading and legend.
 * @prototype index.html:L14603-L14620 `window.WorkloadHeatmap` section
 */
export function WorkloadSection() {
  const { i18n, t } = useTranslation('home');
  const locale = i18n.resolvedLanguage?.startsWith('ar') ? 'ar' : 'en';

  return (
    <section
      className="mt-6 rounded-lg border border-line bg-surface p-5"
      data-testid="workload-section"
    >
      <HomeSectionHead
        right={
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-base font-semibold tracking-[0.08em] text-fg-3 uppercase">
              {t('overview.workload.load')}
            </span>
            {WORKLOAD_LEGEND.map((item) => (
              <span
                className="inline-flex items-center gap-1.5 text-base text-fg-3"
                key={item.label}
              >
                <span
                  className="size-2.5 rounded-[3px]"
                  style={{ background: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        }
        sub={t('overview.workload.subtitle')}
        title={t('overview.workload.title')}
      />
      <Suspense
        fallback={
          <div aria-hidden="true" className="h-64 animate-pulse rounded-lg bg-inset" />
        }
      >
        <WorkloadHeatmap locale={locale} soft={false} />
      </Suspense>
    </section>
  );
}
