import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  OBSERVATION_ASSIGNMENT_OPTIONS,
  OBSERVATION_ROWS,
} from '../data/observations.mock';
import { createEmptyRecordFilter, RecordFilter } from '@/features/organization';
import { Chip } from '@/shared/ui/chip/Chip';

const cellClass = 'border-b border-line px-3.5 py-[11px] text-sm-plus';

/** @prototype ihub/index.html:L6921-L6935 `obsAssign`. */
export function ObservationAssignment() {
  const { t } = useTranslation('observations');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-col gap-4" data-testid="observation-assignment">
      {/* PROTOTYPE-NOOP(D2): visible filter state does not narrow these fixed rows. */}
      <RecordFilter kind="observation" onChange={setFilter} value={filter} />
      <section className="overflow-hidden rounded-xl border border-line bg-surface">
        <header className="flex flex-wrap items-center gap-3 border-b border-line px-[18px] py-3.5">
          <h2 className="m-0 text-base font-semibold text-fg">
            {t('assignment.title')}
          </h2>
          <p className="m-0 text-sm text-fg-3">{t('assignment.subtitle')}</p>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {[
                  t('assignment.columns.observation'),
                  t('assignment.columns.site'),
                  t('assignment.columns.severity'),
                  t('assignment.columns.assignedTo'),
                  '',
                ].map((column, index) => (
                  <th
                    className={`${cellClass} bg-inset text-start text-xs font-semibold tracking-wider whitespace-nowrap text-fg-3 uppercase`}
                    key={`${column}-${String(index)}`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OBSERVATION_ROWS.map((row) => (
                <tr key={row.id}>
                  <td className={cellClass}>
                    <div className="font-semibold text-fg">{row.id}</div>
                    <div className="mt-0.5 text-fg-3">{row.title}</div>
                  </td>
                  <td className={`${cellClass} whitespace-nowrap text-fg-2`}>
                    {row.site}
                  </td>
                  <td className={cellClass}>
                    <Chip tone={row.severityTone}>{row.severity}</Chip>
                  </td>
                  <td className={`${cellClass} min-w-[220px]`}>
                    <select
                      aria-label={t('assignment.assigneeFor', { id: row.id })}
                      className="w-full cursor-pointer rounded-menu border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg"
                      defaultValue={row.assignee}
                      // PROTOTYPE-NOOP(D2): the fixture is not mutated; only a temporary acknowledgement appears.
                      onChange={() => {
                        setMessage(t('assignment.updated', { id: row.id }));
                        window.setTimeout(() => {
                          setMessage('');
                        }, 2400);
                      }}
                    >
                      {OBSERVATION_ASSIGNMENT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={`${cellClass} text-end whitespace-nowrap`}>
                    {/* PROTOTYPE-NOOP(D2): Open has no handler in the prototype. */}
                    <button
                      className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-fg-2 hover:bg-inset"
                      type="button"
                    >
                      {t('actions.open')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {message ? (
          <div className="px-[18px] py-3">
            <Chip tone="ok">{message}</Chip>
          </div>
        ) : null}
      </section>
    </div>
  );
}
