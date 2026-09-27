import type { TFunction } from 'i18next';

import type { MasterStatus } from '../domain/types';
import { cn } from '@/shared/lib/cn';

type MasterStatusChipsProps = Readonly<{
  chipVisibility: Readonly<Record<string, boolean>>;
  counts: Readonly<{ active: number; all: number; inactive: number }>;
  onChange: (status: 'all' | MasterStatus) => void;
  status: 'all' | MasterStatus;
  t: TFunction<'masters'>;
}>;

const isOn = (visibility: Readonly<Record<string, boolean>>, id: string) =>
  visibility[id] !== false;

/**
 * The toolbar's "All / Active / Inactive" status filter strip: a bold "All"
 * label with count, then pill chips with a colored dot and count.
 * @prototype index.html:L4861-L4892
 */
export function MasterStatusChips({
  chipVisibility,
  counts,
  onChange,
  status,
  t,
}: MasterStatusChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {isOn(chipVisibility, 'all') ? (
        <button
          className="inline-flex h-8 items-center gap-1.5 px-0.5"
          data-testid="status-chip-all"
          onClick={() => {
            onChange('all');
          }}
          type="button"
        >
          <span className="text-sm-plus font-bold text-fg">
            {t('chips.all')}
          </span>
          <span className="num text-xs font-semibold text-fg-3">
            {counts.all}
          </span>
        </button>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {(
          ['active', 'inactive'] as const satisfies readonly MasterStatus[]
        ).map((id) => {
          if (!isOn(chipVisibility, id)) return null;
          const on = status === id;
          return (
            <button
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium',
                on
                  ? 'border-accent font-semibold text-accent'
                  : 'border-line-strong text-fg-2',
              )}
              data-testid={`status-chip-${id}`}
              key={id}
              onClick={() => {
                onChange(on ? 'all' : id);
              }}
              type="button"
            >
              <span
                className={cn(
                  'size-1.75 shrink-0 rounded-full',
                  id === 'active' ? 'bg-ok' : 'bg-fg-4',
                )}
              />
              <span className="inline-flex items-baseline gap-1.5">
                <span>{t(`chips.${id}`)}</span>
                <span className="num text-xs-plus font-semibold text-fg-3">
                  {counts[id]}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
