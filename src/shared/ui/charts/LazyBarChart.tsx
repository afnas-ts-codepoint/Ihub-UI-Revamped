import { lazy, Suspense } from 'react';

import type { BarChartProps } from './BarChart';

const BarChart = lazy(async () => {
  const module = await import('./BarChart');
  return { default: module.BarChart };
});

export function LazyBarChart(props: BarChartProps) {
  return (
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          className="animate-pulse rounded-lg bg-inset"
          style={{ height: props.height ?? 140 }}
        />
      }
    >
      <BarChart {...props} />
    </Suspense>
  );
}
