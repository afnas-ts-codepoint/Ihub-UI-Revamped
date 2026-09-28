import { Bolt, Edit3, Eye } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IncidentAction } from './IncidentDialogs';
import { filterIncidents } from '../domain/incidentFilter';
import type { IncidentRuntimeRow } from '../types/incidents.types';
import { createEmptyRecordFilter, RecordFilter, type RecordExportDefinition } from '@/features/organization';
import { TabbedTable, type TableColumn } from '@/shared/table/TabbedTable';
import { Chip } from '@/shared/ui/chip/Chip';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuRoot, DropdownMenuTrigger } from '@/shared/ui/overlay/DropdownMenu';

export function IncidentListing({ flash, onAction, onOpen, rows }: Readonly<{ flash: string; onAction: (action: IncidentAction, row: IncidentRuntimeRow) => void; onOpen: (row: IncidentRuntimeRow) => void; rows: readonly IncidentRuntimeRow[] }>) {
  const { t } = useTranslation('incidents');
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const shown = useMemo(() => filterIncidents(rows, filter), [filter, rows]);
  const exportDefinition: RecordExportDefinition = { label: t('listing.title'), columns: ['Ref #', 'Subject', 'Raised by', 'Site', 'Date', 'Priority', 'Status'], rows: shown.map((row) => [row.id, row.title, row.raisedBy, row.site, row.date, row.priority, row.status]) };
  const actions = ['track', 'compensate', 'task', 'investigate', 'feedback', 'callback', 'close'] as const;
  const columns: readonly TableColumn<IncidentRuntimeRow>[] = [
    { key: 'id', label: t('columns.reference') }, { key: 'title', label: t('columns.subject'), wrap: true }, { key: 'raisedBy', label: t('columns.raisedBy'), muted: true }, { key: 'site', label: t('columns.site'), muted: true }, { key: 'date', label: t('columns.date'), muted: true },
    { key: 'priority', label: t('columns.priority'), render: (row) => <Chip tone={row.priorityTone}>{row.priority}</Chip> },
    { key: 'status', label: t('columns.status'), render: (row) => <div className="inline-flex flex-wrap items-center gap-1.5"><Chip tone={row.statusTone}>{row.status}</Chip>{row.tracked ? <Chip><Eye aria-hidden size={11} />{t('listing.tracking')}</Chip> : null}</div> },
    { key: 'actions', label: '', align: 'end', render: (row) => <div className="inline-flex gap-1.5"><button aria-label={`${t('actions.edit')} ${row.id}`} className="rounded-lg border border-line-strong bg-surface p-1.5 text-accent" onClick={() => { onOpen(row); }} type="button"><Edit3 aria-hidden size={14} /></button><DropdownMenuRoot><DropdownMenuTrigger asChild><button aria-label={`${t('actions.menu')} ${row.id}`} className="rounded-lg border border-line-strong bg-surface p-1.5 text-fg-2" type="button"><Bolt aria-hidden size={15} /></button></DropdownMenuTrigger><DropdownMenuContent>{actions.map((action) => <DropdownMenuItem className={action === 'close' ? 'text-accent' : undefined} key={action} onSelect={() => { onAction(action, row); }}>{t(`actions.${action}`)}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenuRoot></div> },
  ];
  return <><header className="mb-4"><h2 className="display m-0 text-4xl font-medium">{t('listing.title')}</h2><p className="mt-1 text-base text-fg-3">{t('listing.subtitle')}</p></header><RecordFilter activities={['Fun Tiki', 'The Bowl Room', 'Wonder Zone', 'Jump', 'The Court', 'Planet Laser', 'Pixel Run', 'Sky Zone', 'Make*', 'Retail']} exportDefinition={exportDefinition} kind="incident" onChange={setFilter} value={filter} zones={['Zone A', 'Zone B', 'Zone C', 'External']} />{flash ? <Chip className="mb-3" tone="ok">{flash}</Chip> : null}<TabbedTable columns={columns} emptyDescription={t('listing.emptyDescription')} emptyTitle={t('listing.emptyTitle')} paginationLabels={{ next: t('pagination.next'), page: t('pagination.page'), previous: t('pagination.previous'), summary: t('pagination.summary', { count: shown.length }) }} rows={shown} tabs={[{ id: 'open', label: t('listing.open'), count: shown.filter((row) => row.statusTone !== 'ok').length }, { id: 'closed', label: t('listing.closed'), count: shown.filter((row) => row.statusTone === 'ok').length }]} /></>;
}
