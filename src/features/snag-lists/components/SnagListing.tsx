import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createEmptyRecordFilter, RecordFilter } from '@/features/organization';
import { Chip } from '@/shared/ui/chip/Chip';
import type { SnagRow } from '../types/snag-lists.types';

export function SnagListing({ rows }: Readonly<{ rows: readonly SnagRow[] }>) {
  const { t } = useTranslation('snagLists');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const [activeTab, setActiveTab] = useState('open');
  const columns = [
    t('columns.id'),
    t('columns.scope'),
    t('columns.party'),
    t('columns.site'),
    t('columns.items'),
    t('columns.target'),
    t('columns.priority'),
    t('columns.status'),
  ];
  return (
    <div data-testid="snag-listing">
      <RecordFilter kind="observation" onChange={setFilter} value={filter} />
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div
          className="flex items-center gap-1 overflow-x-auto border-b border-line bg-raised px-3 pt-1"
          role="tablist"
        >
          <Tab
            active={activeTab === 'open'}
            label={t('tabs.open')}
            count={3}
            onClick={() => setActiveTab('open')}
          />
          <Tab
            active={activeTab === 'closed'}
            label={t('tabs.closed')}
            count={2}
            onClick={() => setActiveTab('closed')}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-base">
            <thead>
              <tr className="bg-canvas">
                {columns.map((column) => (
                  <th
                    className="border-b border-line px-4 py-[11px] text-start text-xs font-semibold tracking-[0.06em] whitespace-nowrap text-fg-3 uppercase"
                    key={column}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  className="border-b border-line hover:bg-raised"
                  key={row.id}
                >
                  <td className="num px-4 py-[13px] text-start text-fg-2">
                    {row.id}
                  </td>
                  <td className="max-w-[320px] px-4 py-[13px] text-start whitespace-normal text-fg-2">
                    {row.title}
                  </td>
                  <td className="px-4 py-[13px] text-start whitespace-nowrap text-fg-3">
                    {row.party}
                  </td>
                  <td className="px-4 py-[13px] text-start whitespace-nowrap text-fg-3">
                    {row.site}
                  </td>
                  <td className="num px-4 py-[13px] text-start whitespace-nowrap text-fg-2">
                    {row.closed}/{row.items}
                  </td>
                  <td className="px-4 py-[13px] text-start whitespace-nowrap text-fg-3">
                    {row.due}
                  </td>
                  <td className="px-4 py-[13px] text-start whitespace-nowrap">
                    <Chip tone={row.priorityTone}>{row.priority}</Chip>
                  </td>
                  <td className="px-4 py-[13px] text-start whitespace-nowrap">
                    <Chip tone={row.statusTone}>{row.status}</Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-fg-3">
          <span>{t('pagination.showing', { count: rows.length })}</span>
          <div className="flex gap-1">
            <button
              className="rounded-lg px-2.5 py-1 text-sm text-fg-2"
              type="button"
            >
              ‹
            </button>
            <button
              className="rounded-lg bg-accent-dim px-2.5 py-1 text-sm font-semibold text-accent"
              type="button"
            >
              1
            </button>
            <button
              className="rounded-lg px-2.5 py-1 text-sm text-fg-2"
              type="button"
            >
              2
            </button>
            <button
              className="rounded-lg px-2.5 py-1 text-sm text-fg-2"
              type="button"
            >
              3
            </button>
            <button
              className="rounded-lg px-2.5 py-1 text-sm text-fg-2"
              type="button"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tab({
  label,
  count,
  active,
  onClick,
}: Readonly<{
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      aria-label={`${label} ${count}`}
      aria-selected={active}
      className={`group -mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-base whitespace-nowrap ${active ? 'border-accent font-semibold text-fg' : 'border-transparent font-medium text-fg-3'}`}
      data-selected={active}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {label}
      <span
        className={`rounded-full px-[7px] py-px text-xs font-semibold ${active ? 'bg-accent-dim text-accent' : 'bg-canvas text-fg-3'}`}
      >
        {count}
      </span>
    </button>
  );
}
