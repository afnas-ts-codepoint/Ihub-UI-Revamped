import { Activity, ChevronDown, ChevronRight, Download, Filter, GripVertical, Paperclip } from 'lucide-react';
import { Fragment, useMemo, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { CollapsiblePanel } from './CollapsiblePanel';
import { PanelIntro } from './FieldGrid';
import { buildActivityRows, type ActivityFile, type ActivityRow } from '../../data/taskView.mock';
import { Chip } from '@/shared/ui/chip/Chip';

type ColumnId = 'action' | 'attach' | 'department' | 'partnerStatus' | 'user' | 'when';

const COLUMNS: readonly Readonly<{ id: ColumnId; iconOnly?: true; label: string }>[] = [
  { id: 'when', label: 'Date & Time' },
  { id: 'user', label: 'User' },
  { id: 'department', label: 'Department' },
  { id: 'partnerStatus', label: 'Partner Status' },
  { id: 'action', label: 'Action' },
  { iconOnly: true, id: 'attach', label: 'Attachments' },
];

const PAGE_SIZE = 10;

function downloadActivityFile(file: ActivityFile) {
  try {
    const blob = new Blob([`Sample attachment placeholder for ${file.name}`], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 4000);
  } catch {
    // Best-effort, matching the prototype's own swallowed catch.
  }
}

/**
 * Activity History — sortable-by-drag columns, expandable rows and
 * pagination, matching the prototype's Task-Edit-Activity-History table. The
 * three filter selects and the "Remove Filter" control are wired to local
 * state only; nothing in the prototype ever applies them to the row list
 * (`PROTOTYPE-NOOP`) — ported as inert filters, not as functional filtering.
 * "Filters" and "Export History PDF" are plain inert buttons, also ported
 * verbatim (the latter really constructs and downloads a placeholder file per
 * attachment row, same as the prototype's `downloadActivityFile`).
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18523-L18622.
 */
export function ActivityHistoryPanel({
  department,
  seed,
}: Readonly<{ department: string; seed: number }>) {
  const { t } = useTranslation('taskView');
  const rows = useMemo(() => buildActivityRows(seed, department), [department, seed]);
  const [columnOrder, setColumnOrder] = useState<readonly number[]>([0, 1, 2, 3, 4, 5]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const orderedColumns = columnOrder.map((index) => COLUMNS[index]).filter((column) => column !== undefined);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const moveColumn = (from: number, to: number) => {
    setColumnOrder((order) => {
      const next = [...order];
      const [moved] = next.splice(from, 1);
      if (moved !== undefined) next.splice(to, 0, moved);
      return next;
    });
  };

  const renderCell = (columnId: ColumnId, row: ActivityRow) => {
    if (columnId === 'when') return <span className="num font-semibold text-accent">{row.when}</span>;
    if (columnId === 'user')
      return row.isCeo ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="font-semibold text-brand-indigo">{row.user}</span>
          {/* Literal, locale-invariant — the prototype hardcodes 'CEO' without a T() call. */}
          <Chip tone="accent">{'CEO'}</Chip>
        </span>
      ) : (
        row.user
      );
    if (columnId === 'department') return row.department;
    if (columnId === 'partnerStatus') return <Chip tone="accent">{row.partnerStatus}</Chip>;
    if (columnId === 'attach') {
      if (!row.files.length) return <span className="text-fg-4">{'—'}</span>;
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-2 py-0.5 font-semibold text-interactive">
          <Paperclip aria-hidden size={13} />
          <span className="num">{row.files.length}</span>
        </span>
      );
    }
    return (
      <div>
        <div className="font-semibold">{row.action}</div>
        <div className="mt-0.5 text-xs-plus text-fg-3">{row.comment}</div>
      </div>
    );
  };

  return (
    <CollapsiblePanel className="flex-1" icon={Activity} title={t('activity.title')}>
      <PanelIntro>{t('activity.intro')}</PanelIntro>

      <div className="grid grid-cols-1 gap-3.5 tablet:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
        {(
          [
            // Filter labels are passed to the prototype's T(o, o, locale) helper
            // (index.html:L18566) — never translated to Arabic; kept literal.
            ['Department', filterDept, setFilterDept, ['all', department], t('activity.allDepartments')],
            ['Partner Status', filterStatus, setFilterStatus, ['all', 'In Progress', 'Assigned', 'New'], t('activity.allStatuses')],
            ['Activity Type', filterType, setFilterType, ['all', 'Comment Added', 'Status Updated'], t('activity.allTypes')],
          ] as const
        ).map(([label, value, setValue, options, allLabel]) => (
          <label className="flex flex-col gap-1.5" key={label}>
            <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">{label}</span>
            <select
              className="rounded-lg border border-line-strong bg-canvas px-2.5 py-2 text-sm"
              onChange={(event) => {
                setValue(event.target.value);
              }}
              value={value}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? allLabel : option}
                </option>
              ))}
            </select>
          </label>
        ))}
        <div className="flex items-end">
          <button
            className="rounded-lg border border-line-strong px-3 py-2 text-sm font-semibold text-fg-2"
            onClick={() => {
              setFilterDept('all');
              setFilterStatus('all');
              setFilterType('all');
            }}
            type="button"
          >
            {t('activity.removeFilter')}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {orderedColumns.map((column, index) => (
                <th
                  className="cursor-grab border-b border-line px-2 py-2.5 text-start text-xs font-semibold whitespace-nowrap text-fg-3 uppercase"
                  draggable
                  key={column.id}
                  onDragEnd={() => {
                    setDragIndex(null);
                  }}
                  onDragOver={(event: DragEvent<HTMLTableCellElement>) => {
                    event.preventDefault();
                  }}
                  onDragStart={() => {
                    setDragIndex(index);
                  }}
                  onDrop={(event: DragEvent<HTMLTableCellElement>) => {
                    event.preventDefault();
                    if (dragIndex !== null && dragIndex !== index) moveColumn(dragIndex, index);
                    setDragIndex(null);
                  }}
                  scope="col"
                  style={{ opacity: dragIndex === index ? 0.4 : 1 }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <GripVertical aria-hidden className="text-fg-4" size={12} />
                    {column.iconOnly ? (
                      <Paperclip aria-hidden className="text-fg-3" size={14} />
                    ) : (
                      column.label
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <Fragment key={row.id}>
                <tr
                  className={`cursor-pointer ${row.isCeo ? 'bg-brand-indigo/8' : ''}`}
                  onClick={() => {
                    setExpandedId((current) => (current === row.id ? null : row.id));
                  }}
                >
                  {orderedColumns.map((column, columnIndex) => (
                    <td
                      className="border-b border-line px-2 py-2.5"
                      key={column.id}
                      style={
                        row.isCeo && columnIndex === 0
                          ? { borderInlineStart: '3px solid var(--brand-indigo)' }
                          : undefined
                      }
                    >
                      {columnIndex === 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                          {expandedId === row.id ? (
                            <ChevronDown aria-hidden className="shrink-0 text-fg-4" size={12} />
                          ) : (
                            <ChevronRight aria-hidden className="shrink-0 text-fg-4" size={12} />
                          )}
                          {renderCell(column.id, row)}
                        </span>
                      ) : (
                        renderCell(column.id, row)
                      )}
                    </td>
                  ))}
                </tr>
                {expandedId === row.id ? (
                  <tr>
                    <td className="border-b border-line bg-inset px-3.5 py-3" colSpan={orderedColumns.length}>
                      <div className="flex flex-col gap-2.5 text-xs-plus">
                        <div>
                          <strong>{t('activity.comment')}{': '}</strong>
                          {row.comment}
                        </div>
                        {row.files.length ? (
                          <div className="flex flex-col gap-2">
                            <strong>{`${t('activity.attachments')} (${String(row.files.length)})`}</strong>
                            <div className="flex flex-wrap gap-2">
                              {row.files.map((file) => (
                                <div
                                  className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2"
                                  key={file.name}
                                >
                                  <Paperclip aria-hidden className="shrink-0 text-accent" size={15} />
                                  <div>
                                    <div className="truncate text-sm font-semibold">{file.name}</div>
                                    <div className="num text-xs-plus text-fg-3">{file.size}</div>
                                  </div>
                                  <button
                                    aria-label={`${t('activity.download')} ${file.name}`}
                                    className="p-1 text-interactive"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      downloadActivityFile(file);
                                    }}
                                    type="button"
                                  >
                                    <Download aria-hidden size={15} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs-plus text-fg-3">
          {t('activity.showing', { count: pageRows.length, total: rows.length })}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              aria-current={pageNumber === page ? 'page' : undefined}
              className={`num flex size-7.5 items-center justify-center rounded-lg text-xs-plus font-semibold ${pageNumber === page ? 'bg-accent text-accent-ink' : 'border border-line-strong text-fg-2'}`}
              key={pageNumber}
              onClick={() => {
                setPage(pageNumber);
              }}
              type="button"
            >
              {pageNumber}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink"
          type="button"
        >
          <Filter aria-hidden size={13} />
          {t('activity.filters')}
        </button>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3.5 py-2 text-sm font-semibold text-fg-2"
          type="button"
        >
          <Download aria-hidden size={13} />
          {t('activity.exportHistoryPdf')}
        </button>
      </div>
    </CollapsiblePanel>
  );
}
