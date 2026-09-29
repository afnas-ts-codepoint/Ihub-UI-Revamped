import type { ReactNode } from 'react';

/**
 * Minimal Gantt shape needed by the Task View "Sub Task History" dialog's Gantt tab.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L19144-L19171 — the row bars are a fixed,
 * cycling 4-entry lookup applied by row index, not computed from real dates
 * (PROTOTYPE-NOOP). This component stays generic: the feature supplies the bar
 * fraction per row, this component only lays out columns/rows/bars.
 */
export type GanttColumn = Readonly<{ primary: string; secondary: string }>;

export type GanttBar = Readonly<{
  /** 0–1 fraction of the row width where the bar starts. */
  end: number;
  label: string;
  /** 0–1 fraction of the row width where the bar starts. */
  start: number;
  tone: string;
}>;

export type GanttRow = Readonly<{
  badge: ReactNode;
  bar: GanttBar;
  id: string;
  meta: string;
  title: string;
}>;

type GanttChartProps = Readonly<{
  columns: readonly GanttColumn[];
  rowHeaderLabel: string;
  rows: readonly GanttRow[];
}>;

export function GanttChart({ columns, rowHeaderLabel, rows }: GanttChartProps) {
  return (
    <div
      className="flex items-start overflow-hidden rounded-xl border border-line bg-surface"
      data-testid="gantt-chart"
    >
      <div className="w-55 shrink-0 border-e border-line">
        <div className="flex h-14 items-center gap-2 border-b border-line px-4 text-sm font-semibold">
          {rowHeaderLabel}
        </div>
        <div className="bg-raised">
          {rows.map((row, index) => (
            <div
              className={`flex h-16.5 items-center gap-2.5 px-4 ${index < rows.length - 1 ? 'border-b border-line' : ''}`}
              key={row.id}
            >
              <span className="flex size-9.5 shrink-0 items-center justify-center rounded-full bg-accent-dim text-xs font-bold text-accent">
                {row.badge}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-accent">
                  {row.title}
                </span>
                <span className="block truncate text-xs-plus text-fg-3">{row.meta}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="min-w-0 flex-1 overflow-x-auto">
        <div style={{ minWidth: columns.length * 96 }}>
          <div
            className="grid border-b border-line"
            style={{ gridTemplateColumns: `repeat(${String(columns.length)}, minmax(96px, 1fr))` }}
          >
            {columns.map((column, index) => (
              <div
                className={`flex h-14 flex-col items-center justify-center px-2 text-center ${index ? 'border-s border-line' : ''}`}
                key={`${column.primary}-${String(index)}`}
              >
                <span className="text-sm-plus font-semibold">{column.primary}</span>
                <span className="mt-0.5 text-xs-plus text-fg-3">{column.secondary}</span>
              </div>
            ))}
          </div>
          <div className="bg-raised">
            {rows.map((row, index) => (
              <div
                className={`relative flex h-16.5 ${index < rows.length - 1 ? 'border-b border-line' : ''}`}
                key={row.id}
              >
                {columns.map((column, columnIndex) => (
                  <div
                    className={`flex-1 ${columnIndex ? 'border-s border-line' : ''}`}
                    key={`${column.primary}-${String(columnIndex)}`}
                  />
                ))}
                <div
                  className="absolute top-1/2 flex h-8 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full px-2.5"
                  data-testid="gantt-bar"
                  style={{
                    background: row.bar.tone,
                    insetInlineStart: `${String(row.bar.start * 100)}%`,
                    width: `${String((row.bar.end - row.bar.start) * 100)}%`,
                  }}
                >
                  <span className="truncate text-sm font-semibold text-white">
                    {row.bar.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
