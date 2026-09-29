import type { ReactNode } from 'react';

/**
 * Read-only label/value pairs used across the simple Task View info panels.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L17984-L18002 `kicker`/`field`/`gridN`.
 */
export function FieldItem({ label, value }: Readonly<{ label: string; value: ReactNode }>) {
  return (
    <div className="min-w-0">
      <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">{label}</span>
      <div className="mt-1.5 text-sm-plus text-fg">
        {value === '' || value === null || value === undefined ? '—' : value}
      </div>
    </div>
  );
}

export function FieldGrid({
  children,
  columns = 3,
}: Readonly<{ children: ReactNode; columns?: 2 | 3 | 4 }>) {
  const columnClass =
    columns === 2
      ? 'grid-cols-1 tablet:grid-cols-2'
      : columns === 4
        ? 'grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4'
        : 'grid-cols-1 tablet:grid-cols-3';
  return <div className={`grid gap-x-4 gap-y-3.5 ${columnClass}`}>{children}</div>;
}

export function PanelIntro({ children }: Readonly<{ children: ReactNode }>) {
  return <p className="m-0 text-xs-plus text-fg-3">{children}</p>;
}
