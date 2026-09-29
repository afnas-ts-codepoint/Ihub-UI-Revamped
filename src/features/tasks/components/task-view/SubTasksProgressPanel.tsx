import { Check, CheckSquare, ChevronRight, Clock, Tag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CollapsiblePanel } from './CollapsiblePanel';
import { PanelIntro } from './FieldGrid';
import {
  SUBTASK_PROGRESS_ROWS,
  type SubtaskProgressRow,
  type SubtaskStatus,
} from '../../data/taskView.mock';
import { Chip } from '@/shared/ui/chip/Chip';

const STATUS_TONE: Readonly<Record<SubtaskStatus, 'accent' | 'info' | 'warn'>> = {
  done: 'info',
  pending: 'warn',
  progress: 'accent',
};

function average(rows: readonly SubtaskProgressRow[]) {
  if (!rows.length) return 0;
  return Math.round(rows.reduce((total, row) => total + row.percent, 0) / rows.length);
}

/**
 * Sub Tasks Progress — department/sub-department filters over the 7-row
 * `EDIT_SUBTASKS` fixture, grouped into per-department cards. Row clicks call
 * the prototype's shared `openStCard`, which branches on mode: read-only
 * opens the Sub Task History dialog (`onOpenHistory`); edit mode opens the
 * Update Sub Tasks / Resolution Tasks dialog (`onUpdateSubTasks`) — the exact
 * same unfiltered dialog the header's own "Update Sub Tasks" button opens,
 * regardless of which row was clicked (`openStCard` takes no row argument).
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18151-L18239 (rows),
 * L18188-L18208 (`openStCard`/`stCard`).
 */
export function SubTasksProgressPanel({
  interaction = 'history',
  onOpenHistory,
  onUpdateSubTasks,
}: Readonly<{
  interaction?: 'history' | 'pending-update';
  onOpenHistory: () => void;
  onUpdateSubTasks?: () => void;
}>) {
  const openStCard = interaction === 'pending-update' ? (onUpdateSubTasks ?? onOpenHistory) : onOpenHistory;
  const { t } = useTranslation('taskView');
  const [department, setDepartment] = useState('');
  const [subDepartment, setSubDepartment] = useState('');

  const departments = useMemo(
    () => [...new Set(SUBTASK_PROGRESS_ROWS.map((row) => row.department))],
    [],
  );
  const subDepartments = useMemo(
    () => [
      ...new Set(
        SUBTASK_PROGRESS_ROWS.filter((row) => !department || row.department === department).map(
          (row) => row.subDepartment,
        ),
      ),
    ],
    [department],
  );
  const rows = SUBTASK_PROGRESS_ROWS.filter(
    (row) =>
      (!department || row.department === department) &&
      (!subDepartment || row.subDepartment === subDepartment),
  );
  const groups = departments
    .map((dept) => [dept, rows.filter((row) => row.department === dept)] as const)
    .filter(([, groupRows]) => groupRows.length);

  const statusCount = (status: SubtaskStatus) => rows.filter((row) => row.status === status).length;

  return (
    <CollapsiblePanel defaultOpen icon={CheckSquare} title={t('subtasks.title')}>
      <PanelIntro>{t('subtasks.intro')}</PanelIntro>

      <div className="flex flex-wrap items-end gap-2.5">
        <label className="flex min-w-40 flex-1 flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
            {t('subtasks.department')}
          </span>
          <select
            className="rounded-lg border border-line-strong bg-canvas px-2.5 py-2 text-sm"
            onChange={(event) => {
              setDepartment(event.target.value);
              setSubDepartment('');
            }}
            value={department}
          >
            <option value="">
              {t('subtasks.allDepartments', { count: SUBTASK_PROGRESS_ROWS.length })}
            </option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {`${dept} (${String(SUBTASK_PROGRESS_ROWS.filter((row) => row.department === dept).length)})`}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-40 flex-1 flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
            {t('subtasks.subDepartment')}
          </span>
          <select
            className="rounded-lg border border-line-strong bg-canvas px-2.5 py-2 text-sm"
            onChange={(event) => {
              setSubDepartment(event.target.value);
            }}
            value={subDepartment}
          >
            <option value="">{t('subtasks.allSubDepartments')}</option>
            {subDepartments.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </label>
        {department || subDepartment ? (
          <button
            className="rounded-lg border border-line-strong px-3 py-2 text-sm font-semibold text-fg-2"
            onClick={() => {
              setDepartment('');
              setSubDepartment('');
            }}
            type="button"
          >
            {t('subtasks.reset')}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-raised px-3.5 py-2.5 text-sm-plus">
        <span className="font-semibold">
          <span className="num">{groups.length}</span> {t('subtasks.departmentsCount', { count: groups.length })}
        </span>
        <span className="text-fg-4">{'·'}</span>
        <span>
          <span className="num">{rows.length}</span> {t('subtasks.subtasksCount')}
        </span>
        <span className="text-fg-4">{'·'}</span>
        {(['done', 'progress', 'pending'] as const).map((status) => (
          <Chip key={status} tone={STATUS_TONE[status]}>
            <span className="num">{statusCount(status)}</span> {t(`subtasks.status.${status}`)}
          </Chip>
        ))}
      </div>

      {groups.length ? (
        <div className="grid grid-cols-1 gap-3 desktop:grid-cols-2">
          {groups.map(([dept, groupRows]) => (
            <div className="overflow-hidden rounded-lg border border-line bg-surface" key={dept}>
              <div className="flex items-center gap-2.5 border-b border-line bg-accent-dim px-3.5 py-3">
                <span className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-ink">
                  {dept.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm-plus font-semibold">{dept}</div>
                  <div className="text-xs-plus text-fg-3">
                    {[...new Set(groupRows.map((row) => row.subDepartment))].length}{' '}
                    {t('subtasks.subDepartmentsCount')}
                  </div>
                </div>
                <span className="num shrink-0 text-xs-plus font-semibold">{`${String(average(groupRows))}%`}</span>
              </div>
              {groupRows.map((row) => (
                <button
                  className="flex w-full flex-col gap-1.5 border-t border-line p-3.5 text-start first:border-t-0"
                  key={row.title}
                  onClick={openStCard}
                  title={interaction === 'history' ? t('subtasks.viewHistory') : t('subtasks.update')}
                  type="button"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm-plus font-semibold">{row.title}</span>
                    <span className="num rounded-md bg-accent-dim px-2 py-0.5 text-xs-plus font-semibold text-accent">
                      {`${String(row.percent)}%`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs-plus">
                    <span className="inline-flex items-center gap-1 font-semibold text-accent uppercase">
                      <Tag aria-hidden size={11} />
                      {row.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-line bg-raised px-2 py-0.5 text-fg-2">
                      {row.department}
                      <ChevronRight aria-hidden className="text-fg-4" size={11} />
                      <span className="font-medium text-accent">{row.subDepartment}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs-plus text-fg-3">
                      {t('subtasks.due')}
                      {': '}
                      {row.due}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Chip tone={STATUS_TONE[row.status]}>{t(`subtasks.status.${row.status}`)}</Chip>
                      <Chip tone={row.slaOk ? 'ok' : 'warn'}>
                        {row.slaOk ? <Check aria-hidden size={11} /> : <Clock aria-hidden size={11} />}
                        {row.slaOk ? t('subtasks.withinSla') : t('subtasks.atRisk')}
                      </Chip>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="m-0 rounded-lg border border-dashed border-line-strong py-6 text-center text-sm-plus text-fg-3">
          {t('subtasks.noMatches')}
        </p>
      )}
    </CollapsiblePanel>
  );
}
