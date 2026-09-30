import { Pencil } from 'lucide-react';
import type { useTranslation } from 'react-i18next';

import type { TableColumn } from '@/shared/table';
import { Chip } from '@/shared/ui/chip/Chip';

import type {
  ActionSheetCostRow,
  ActionSheetEditRow,
  ActionSheetHistoryRow,
  ActionSheetMissingRow,
  ActionSheetPrepayRow,
} from '../types/paymentSettlement.types';
import { rowActionButtonClass } from './actionSheetButtonStyles';

type ColumnLabels = Readonly<{
  action: string;
  advance: string;
  budgetLine: string;
  by: string;
  currency: string;
  date: string;
  daysPending: string;
  department: string;
  id: string;
  missing: string;
  note: string;
  recorded: string;
  status: string;
  supplier: string;
  title: string;
  type: string;
  value: string;
  variance: string;
}>;

export function actionSheetColumnLabels(
  t: ReturnType<typeof useTranslation<'paymentSettlement'>>['t'],
): ColumnLabels {
  return {
    action: t('actionSheet.columns.action'),
    advance: t('actionSheet.columns.advance'),
    budgetLine: t('actionSheet.columns.budgetLine'),
    by: t('actionSheet.columns.by'),
    currency: t('actionSheet.columns.currency'),
    date: t('actionSheet.columns.date'),
    daysPending: t('actionSheet.columns.daysPending'),
    department: t('actionSheet.columns.department'),
    id: t('actionSheet.columns.id'),
    missing: t('actionSheet.columns.missing'),
    note: t('actionSheet.columns.note'),
    recorded: t('actionSheet.columns.recorded'),
    status: t('actionSheet.columns.status'),
    supplier: t('actionSheet.columns.supplier'),
    title: t('actionSheet.columns.title'),
    type: t('actionSheet.columns.type'),
    value: t('actionSheet.columns.value'),
    variance: t('actionSheet.columns.variance'),
  };
}

/** @prototype index.html:L17180-L17188 `editCols` (row action re-selects the Create tab — `PROTOTYPE-NOOP(D2)`: no draft is loaded). */
export function actionSheetEditColumns(
  labels: ColumnLabels,
  editLabel: string,
  onEdit: () => void,
): readonly TableColumn<ActionSheetEditRow>[] {
  return [
    { key: 'id', label: labels.id, render: (row) => <span className="num font-semibold">{row.id}</span> },
    { key: 'title', label: labels.title, wrap: true },
    { key: 'dept', label: labels.department, muted: true },
    { align: 'end', key: 'value', label: labels.value, render: (row) => <span className="num font-semibold">{row.value}</span> },
    { key: 'type', label: labels.type, muted: true },
    { key: 'status', label: labels.status, render: (row) => <Chip tone={row.tone}>{row.status}</Chip> },
    {
      align: 'end', key: 'act', label: '',
      render: () => (
        <button className={rowActionButtonClass} onClick={onEdit} type="button">
          <Pencil aria-hidden="true" size={13} />
          {editLabel}
        </button>
      ),
    },
  ];
}

/** @prototype index.html:L17196-L17202 `missCols` */
export function actionSheetMissingColumns(labels: ColumnLabels): readonly TableColumn<ActionSheetMissingRow>[] {
  return [
    { key: 'id', label: labels.id, render: (row) => <span className="num font-semibold">{row.id}</span> },
    { key: 'title', label: labels.title, wrap: true },
    {
      key: 'missing', label: labels.missing,
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.missing.map((item) => <Chip key={item} tone="bad">{item}</Chip>)}
        </div>
      ),
    },
    { key: 'supplier', label: labels.supplier, muted: true },
    { align: 'end', key: 'days', label: labels.daysPending, render: (row) => <span className="num font-semibold">{row.days}</span> },
  ];
}

/** @prototype index.html:L17210-L17217 `prepayCols` */
export function actionSheetPrepayColumns(labels: ColumnLabels): readonly TableColumn<ActionSheetPrepayRow>[] {
  return [
    { key: 'id', label: labels.id, render: (row) => <span className="num font-semibold">{row.id}</span> },
    { key: 'supplier', label: labels.supplier, wrap: true },
    { align: 'end', key: 'advance', label: labels.advance, render: (row) => <span className="num font-semibold">{row.advance}</span> },
    { key: 'ccy', label: labels.currency, muted: true },
    { key: 'date', label: labels.date, muted: true },
    { key: 'status', label: labels.status, render: (row) => <Chip tone={row.tone}>{row.status}</Chip> },
  ];
}

/** @prototype index.html:L17225-L17232 `costCols` */
export function actionSheetCostColumns(labels: ColumnLabels): readonly TableColumn<ActionSheetCostRow>[] {
  return [
    { key: 'id', label: labels.id, render: (row) => <span className="num font-semibold">{row.id}</span> },
    { key: 'title', label: labels.title, wrap: true },
    { key: 'line', label: labels.budgetLine, muted: true },
    { align: 'end', key: 'recorded', label: labels.recorded, render: (row) => <span className="num font-semibold">{row.recorded}</span> },
    {
      align: 'end', key: 'variance', label: labels.variance,
      render: (row) => (
        <span className={`num font-semibold ${row.vTone === 'bad' ? 'text-bad' : row.vTone === 'ok' ? 'text-ok' : 'text-fg-3'}`}>
          {row.variance}
        </span>
      ),
    },
    { key: 'status', label: labels.status, render: (row) => <Chip tone={row.tone}>{row.status}</Chip> },
  ];
}

/** @prototype index.html:L17240-L17246 `histCols` */
export function actionSheetHistoryColumns(labels: ColumnLabels): readonly TableColumn<ActionSheetHistoryRow>[] {
  return [
    { key: 'date', label: labels.date, muted: true },
    { key: 'id', label: labels.id, render: (row) => <span className="num font-semibold">{row.id}</span> },
    { key: 'action', label: labels.action, render: (row) => <Chip tone={row.tone || undefined}>{row.action}</Chip> },
    { key: 'by', label: labels.by, muted: true },
    { key: 'note', label: labels.note, muted: true, wrap: true },
  ];
}
