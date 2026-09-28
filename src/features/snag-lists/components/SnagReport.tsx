import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createEmptyRecordFilter, RecordFilter } from '@/features/organization';
import type { SnagRow } from '../types/snag-lists.types';

export function SnagReport({ rows }: Readonly<{ rows: readonly SnagRow[] }>) {
  const { t } = useTranslation('snagLists');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const totalItems = rows.reduce((total, row) => total + row.items, 0);
  const closedItems = rows.reduce((total, row) => total + row.closed, 0);
  const parties = Array.from(new Set(rows.map((row) => row.party)));
  return (
    <div className="flex flex-col gap-4" data-testid="snag-report">
      <RecordFilter kind="observation" onChange={setFilter} value={filter} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
        {[
          [t('report.snagLists'), String(rows.length)],
          [
            t('report.openLists'),
            String(rows.filter((row) => row.closed < row.items).length),
          ],
          [t('report.itemsClosed'), `${closedItems} / ${totalItems}`],
          [
            t('report.completion'),
            `${Math.round((closedItems / totalItems) * 100)}%`,
          ],
        ].map(([label, value]) => (
          <div
            className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface p-[18px]"
            key={label}
          >
            <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">
              {label}
            </span>
            <span className="num text-[26px] font-semibold text-fg">
              {value}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-[22px]">
        <span className="eyebrow">{t('report.byParty')}</span>
        {parties.map((party) => {
          const partyRows = rows.filter((row) => row.party === party);
          const items = partyRows.reduce((total, row) => total + row.items, 0);
          const closed = partyRows.reduce(
            (total, row) => total + row.closed,
            0,
          );
          const percentage = Math.round((closed / items) * 100);
          return (
            <div className="flex items-center gap-3" key={party}>
              <span className="w-[200px] shrink-0 text-sm-plus font-medium">
                {party}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-raised">
                <span
                  className={`block h-full rounded-full ${percentage === 100 ? 'bg-ok' : 'bg-accent'}`}
                  style={{ width: `${percentage}%` }}
                />
              </span>
              <span className="num w-[74px] text-end text-sm text-fg-2">
                {closed}/{items} · {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
