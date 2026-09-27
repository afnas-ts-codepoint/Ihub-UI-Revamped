import type { CSSProperties } from 'react';

export type BarChartDatum = Readonly<{
  label: string;
  value: number;
}>;

type BarChartProps = Readonly<{
  ariaLabel: string;
  data: readonly BarChartDatum[];
  height?: number;
  max?: number;
  palette?: readonly string[];
}>;

type ChartStyle = CSSProperties & Readonly<Record<`--chart-${string}`, string>>;

export const TAMDEEN_CHART_PALETTE = [
  'var(--brand-purple)',
  'var(--brand-indigo)',
  'var(--brand-periwinkle)',
  'var(--brand-lilac)',
  'var(--brand-pink)',
  'var(--brand-yellow)',
  'var(--brand-orange)',
  'var(--brand-red)',
] as const;

export function barHeightPercentage(value: number, max: number) {
  return max > 0 ? (value / max) * 100 : 0;
}

/** @prototype index.html:L1929-L1987 BarChart */
export function BarChart({
  ariaLabel,
  data,
  height = 140,
  max,
  palette = TAMDEEN_CHART_PALETTE,
}: BarChartProps) {
  const chartMax = max ?? Math.max(0, ...data.map((item) => item.value));

  return (
    <div aria-label={ariaLabel} role="img">
      <div
        className="budget-chart-bars flex items-end gap-1.5"
        style={
          { '--chart-container-height': `${String(height)}px` } as ChartStyle
        }
      >
        {data.map((item, index) => {
          const color = palette[index % palette.length] ?? 'var(--accent)';
          const style = {
            '--chart-bar-color': color,
            '--chart-bar-delay': `${String(index * 0.05)}s`,
            '--chart-bar-height': `${String(barHeightPercentage(item.value, chartMax))}%`,
          } as ChartStyle;

          return (
            <div
              className="flex h-full flex-1 flex-col items-center gap-1.5"
              key={`${item.label}-${String(index)}`}
            >
              <div className="flex w-full flex-1 flex-col justify-end">
                <div
                  className="budget-chart-bar min-h-0.5 rounded-t-[4px]"
                  data-value={item.value}
                  style={style}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5" aria-hidden="true">
        {data.map((item, index) => (
          <div
            className="num flex-1 text-center text-xs text-fg-3"
            key={`${item.label}-${String(index)}`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
