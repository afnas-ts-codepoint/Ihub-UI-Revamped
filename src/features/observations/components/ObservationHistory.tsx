import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { OBSERVATION_HISTORY_ROWS } from '../data/observations.mock';
import { createEmptyRecordFilter, RecordFilter } from '@/features/organization';

const cellClass = 'border-b border-line px-3.5 py-[11px] text-sm-plus';

/** @prototype ihub/index.html:L6913-L6920 `obsHistory`. */
export function ObservationHistory() {
  const { t } = useTranslation('observations');
  const [filter, setFilter] = useState(createEmptyRecordFilter);

  return (
    <div className="flex flex-col gap-4" data-testid="observation-history">
      {/* PROTOTYPE-NOOP(D2): visible filter state does not narrow these fixed rows. */}
      <RecordFilter kind="observation" onChange={setFilter} value={filter} />
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {[
                  t('history.columns.ref'),
                  t('history.columns.observation'),
                  t('history.columns.action'),
                  t('history.columns.by'),
                  t('history.columns.date'),
                  t('history.columns.note'),
                ].map((column) => (
                  <th
                    className={`${cellClass} bg-inset text-start text-xs font-semibold tracking-wider whitespace-nowrap text-fg-3 uppercase`}
                    key={column}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OBSERVATION_HISTORY_ROWS.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td
                      className={`${cellClass} ${index === 0 ? 'font-semibold text-fg' : 'text-fg-2'}`}
                      key={`${row[0]}-${String(index)}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
