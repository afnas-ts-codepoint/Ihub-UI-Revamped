import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import type { AnalyticsDatum, AnalyticsTone } from '../../data/analytics.mock';

/**
 * The small chart primitives the Overview analytics panels use (the Tasks
 * module's `Donut`, `HBar`, `VBars`, `Bar`, `StatTile` and the shared `Stat`).
 * They are feature-local: the Tasks dashboard's own charts are private to it
 * and differ in layout. Colours arrive as CSS values, as in the prototype, so
 * they follow the theme.
 * @prototype index.html:L15983-L16040 `TASKSUI` primitives; L1080-L1170 `Stat`
 */

const TONE_COLOR: Readonly<Record<AnalyticsTone | 'accent' | 'default', string>> = {
  accent: 'var(--accent)',
  bad: 'var(--bad)',
  default: 'var(--text)',
  ok: 'var(--ok)',
  warn: 'var(--warn)',
};

const colorStyle = (color: string): CSSProperties => ({ color });
const fillStyle = (color: string, width: string): CSSProperties => ({
  background: color,
  width,
});
const physicalEnd: CSSProperties = { textAlign: 'right' };

export function Donut({ data }: Readonly<{ data: readonly AnalyticsDatum[] }>) {
  const { t } = useTranslation('home');
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6">
      <div className="relative size-[132px] shrink-0">
        <svg className="size-[132px] -rotate-90" viewBox="0 0 132 132">
          <circle
            cx={66}
            cy={66}
            fill="none"
            r={radius}
            stroke="var(--line)"
            strokeWidth={14}
          />
          {data.map((item, index) => {
            const length = (item.value / total) * circumference;
            const offset = data
              .slice(0, index)
              .reduce((used, previous) => used + (previous.value / total) * circumference, 0);
            return (
              <circle
                cx={66}
                cy={66}
                fill="none"
                key={item.label}
                r={radius}
                stroke={item.color}
                strokeDasharray={`${String(length)} ${String(circumference - length)}`}
                strokeDashoffset={-offset}
                strokeWidth={14}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="display num text-6xl leading-none font-medium">{total}</span>
          <span className="mt-0.5 text-xs text-fg-3">{t('overview.analytics.donutUnit')}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-[11px]">
        {data.map((item) => (
          <div className="flex items-center gap-2.5" key={item.label}>
            <span
              className="size-[9px] shrink-0 rounded-[3px]"
              style={{ background: item.color }}
            />
            <span className="flex-1 text-base-plus text-fg-2">{item.label}</span>
            <span className="num text-base text-fg-3">
              {`${String(Math.round((item.value / total) * 100))}%`}
            </span>
            <span
              className="num min-w-[26px] text-md font-semibold"
              style={physicalEnd}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HBar({
  color,
  label,
  max,
  value,
}: Readonly<{ color?: string; label: string; max: number; value: number }>) {
  return (
    <div className="grid grid-cols-[150px_1fr_32px] items-center gap-3.5">
      <span
        className="truncate text-base text-fg-2"
        style={physicalEnd}
      >
        {label}
      </span>
      <div className="h-2.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full"
          style={fillStyle(color ?? 'var(--accent)', `${String((value / max) * 100)}%`)}
        />
      </div>
      <span className="num text-md font-semibold" style={physicalEnd}>
        {value}
      </span>
    </div>
  );
}

export function VBars({
  data,
  height = 190,
}: Readonly<{ data: readonly AnalyticsDatum[]; height?: number }>) {
  const max = Math.max(...data.map((item) => item.value));
  return (
    <div
      className="flex items-end justify-between gap-2.5"
      style={{ height }}
    >
      {data.map((item) => (
        <div
          className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          key={item.label}
        >
          <span className="num text-md font-semibold text-fg">{item.value}</span>
          <div
            className="min-h-1 w-full max-w-[34px] rounded-t-[7px] rounded-b-[2px]"
            style={{
              background: item.color,
              height: `${String((item.value / max) * 100)}%`,
            }}
          />
          <span
            className="w-full truncate text-center text-xs leading-[1.2] text-fg-3"
            title={item.label}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Bar({
  label,
  pct,
  tone,
}: Readonly<{ label: string; pct: number; tone: AnalyticsTone }>) {
  return (
    <div className="flex flex-col gap-[7px]">
      <div className="flex items-baseline justify-between">
        <span className="text-base-plus font-medium text-fg">{label}</span>
        <span className="num text-base font-semibold" style={colorStyle(TONE_COLOR[tone])}>
          {`${String(pct)}%`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full"
          style={fillStyle(TONE_COLOR[tone], `${String(pct)}%`)}
        />
      </div>
    </div>
  );
}

export function StatTile({
  label,
  tone,
  value,
}: Readonly<{ label: string; tone: AnalyticsTone; value: string }>) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line bg-[var(--surface-2,rgba(0,0,0,0.02))] px-4 py-3.5">
      <span
        className="display num text-6xl leading-none font-medium"
        style={colorStyle(TONE_COLOR[tone])}
      >
        {value}
      </span>
      <span className="text-xs font-semibold tracking-[0.08em] text-fg-3 uppercase">
        {label}
      </span>
    </div>
  );
}

function Sparkline({ data, height }: Readonly<{ data: readonly number[]; height: number }>) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const points = data.map((value, index) => [
    (index / (data.length - 1)) * width,
    height - ((value - min) / range) * (height - 4) - 2,
  ]);
  const line = points
    .map(
      ([x, y], index) =>
        `${index ? 'L' : 'M'}${(x ?? 0).toFixed(1)} ${(y ?? 0).toFixed(1)}`,
    )
    .join(' ');
  return (
    <svg
      aria-hidden="true"
      className="block w-full overflow-visible"
      preserveAspectRatio="none"
      style={{ height }}
      viewBox={`0 0 ${String(width)} ${String(height)}`}
    >
      <path d={`${line} L${String(width)} ${String(height)} L0 ${String(height)} Z`} fill="var(--accent-dim)" />
      <path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function Stat({
  delta,
  label,
  spark,
  tone,
  value,
}: Readonly<{
  delta: string;
  label: string;
  spark: readonly number[];
  tone: 'accent' | 'ok';
  value: number;
}>) {
  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-[18px] transition-[border-color,box-shadow] hover:border-line-strong">
      <span className="text-base font-medium text-fg-3">{label}</span>
      <div className="flex items-baseline gap-2.5">
        <span
          className="display num text-10xl leading-none font-medium"
          style={colorStyle(TONE_COLOR[tone])}
        >
          {value}
        </span>
        <span
          className="num text-sm font-semibold"
          style={colorStyle(delta.startsWith('+') ? 'var(--ok)' : 'var(--bad)')}
        >
          {delta}
        </span>
      </div>
      <Sparkline data={spark} height={28} />
    </div>
  );
}
