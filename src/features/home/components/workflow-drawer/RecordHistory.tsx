import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

import {
  recordHistory,
  type RecordHistoryKind,
  type RecordHistoryTone,
} from '../../domain/recordHistory';

const DOT_CLASS: Readonly<Record<RecordHistoryTone, string>> = {
  created: 'bg-accent',
  update: 'bg-fg-3',
  warn: 'bg-warn',
};

/**
 * Collapsible "History & updates" card of the drawer (`RecordHUD`, compact:
 * collapsed by default). The history is synthetic and newest first.
 * @prototype ihub/index.html:L1257-L1280 `RecordHUD`
 */
export function RecordHistory({
  id,
  kind,
  status,
}: Readonly<{ id: string; kind: RecordHistoryKind; status: string }>) {
  const { t } = useTranslation('homeWorkflow');
  const [open, setOpen] = useState(false);
  const listId = useId();
  const shown = useMemo(
    () => [...recordHistory(id, kind)].reverse(),
    [id, kind],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <button
        aria-controls={listId}
        aria-expanded={open}
        className={cn(
          'flex w-full flex-wrap items-center gap-2.5 bg-raised px-4 py-[13px] text-start',
          open && 'border-b border-line',
        )}
        onClick={() => {
          setOpen((current) => !current);
        }}
        type="button"
      >
        <span className="flex text-accent">
          <Icon name="clock" size={15} />
        </span>
        <span className="text-base font-semibold tracking-[-0.01em]">
          {t('drawer.blocks.history')}
        </span>
        <span className="num text-xs-plus font-semibold text-fg-3">{id}</span>
        <span className="ms-auto inline-flex items-center gap-2">
          <Chip className="px-[9px] font-semibold">{status}</Chip>
          <Chip className="bg-surface">
            {t('drawer.history.events', { n: shown.length })}
          </Chip>
          <span
            className={cn(
              'flex text-fg-4 transition-transform',
              open && 'rotate-180',
            )}
          >
            <Icon name="chevron-down" size={15} />
          </span>
        </span>
      </button>
      {open ? (
        <ul
          className="m-0 flex max-h-[300px] list-none flex-col gap-3 overflow-y-auto px-4 py-3.5"
          id={listId}
        >
          {shown.map((entry) => (
            <li className="flex items-start gap-2.5" key={entry.text}>
              <span
                className={cn(
                  'mt-[5px] size-2 shrink-0 rounded-full',
                  DOT_CLASS[entry.tone],
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="text-base-plus leading-[1.4] font-semibold text-fg">
                  {entry.text}
                </div>
                <div className="mt-0.5 text-xs-plus text-fg-3">
                  {`${entry.by} · ${entry.when}`}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
