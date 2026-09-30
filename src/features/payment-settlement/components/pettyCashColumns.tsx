import { Pencil, Plus } from 'lucide-react';
import type { useTranslation } from 'react-i18next';

import type { TableColumn } from '@/shared/table';
import { Chip } from '@/shared/ui/chip/Chip';

import type {
  PettyCashEditRow,
  PettyCashHistoryRow,
  PettyCashListingRow,
  PettyCashSettleRow,
} from '../types/paymentSettlement.types';
import { rowActionButtonClass } from './actionSheetButtonStyles';

type Translate = ReturnType<typeof useTranslation<'paymentSettlement'>>['t'];

const num = (value: string) => <span className="num font-semibold">{value}</span>;

/** @prototype index.html:L9554-L9596 `cols` — the row action only switches Reimburse to its Request sub-tab. */
export function pettyCashListingColumns(t: Translate, onReimburse: () => void): readonly TableColumn<PettyCashListingRow>[] {
  return [
    { key: 'id', label: t('pettyCash.columns.id') },
    { key: 'title', label: t('pettyCash.columns.reimbursement'), wrap: true },
    { key: 'employee', label: t('pettyCash.columns.employee'), muted: true },
    { key: 'dept', label: t('pettyCash.columns.department'), muted: true },
    { align: 'end', key: 'value', label: t('pettyCash.columns.amount'), render: (row) => num(row.value) },
    { key: 'submitted', label: t('pettyCash.columns.submitted'), muted: true },
    { key: 'status', label: t('pettyCash.columns.status'), render: (row) => <Chip tone={row.tone}>{row.status}</Chip> },
    {
      align: 'end', key: 'reimburse', label: '',
      render: () => (
        <button className={rowActionButtonClass} onClick={onReimburse} type="button">
          <Plus aria-hidden="true" size={13} />
          {t('pettyCash.actions.reimburseRequest')}
        </button>
      ),
    },
  ];
}

/** @prototype index.html:L9633-L9642 `pcEditActBtn` / `pcEditCols` — the Edit button has no onClick (`PROTOTYPE-NOOP(D2)`). */
export function pettyCashEditColumns(t: Translate): readonly TableColumn<PettyCashEditRow>[] {
  return [
    { key: 'id', label: t('pettyCash.columns.id') },
    { key: 'employee', label: t('pettyCash.columns.employee'), muted: true },
    { key: 'dept', label: t('pettyCash.columns.department'), muted: true },
    { align: 'end', key: 'amount', label: t('pettyCash.columns.amount'), render: (row) => num(row.amount) },
    { key: 'submitted', label: t('pettyCash.columns.submitted'), muted: true },
    { key: 'status', label: t('pettyCash.columns.status'), render: (row) => <Chip tone={row.tone}>{row.status}</Chip> },
    {
      align: 'end', key: 'act', label: '',
      render: () => (
        <button className={rowActionButtonClass} type="button">
          <Pencil aria-hidden="true" size={13} />
          {t('pettyCash.actions.edit')}
        </button>
      ),
    },
  ];
}

/** @prototype index.html:L9648-L9654 `pcHistCols` */
export function pettyCashHistoryColumns(t: Translate): readonly TableColumn<PettyCashHistoryRow>[] {
  return [
    { key: 'date', label: t('pettyCash.columns.date'), muted: true },
    { key: 'id', label: t('pettyCash.columns.id'), render: (row) => num(row.id) },
    { key: 'action', label: t('pettyCash.columns.action'), render: (row) => <Chip tone={row.tone}>{row.action}</Chip> },
    { key: 'by', label: t('pettyCash.columns.by'), muted: true },
    { key: 'note', label: t('pettyCash.columns.note'), muted: true, wrap: true },
  ];
}

/** @prototype index.html:L9713-L9724 `settleCols` — the Settle Request button has no onClick (`PROTOTYPE-NOOP(D2)`). */
export function pettyCashSettleColumns(t: Translate): readonly TableColumn<PettyCashSettleRow>[] {
  return [
    { key: 'id', label: t('pettyCash.columns.id') },
    { key: 'employee', label: t('pettyCash.columns.employee'), muted: true },
    { align: 'end', key: 'advance', label: t('pettyCash.columns.advance'), render: (row) => num(row.advance) },
    { align: 'end', key: 'spent', label: t('pettyCash.columns.spent'), render: (row) => <span className="num">{row.spent}</span> },
    { align: 'end', key: 'balance', label: t('pettyCash.columns.balance'), render: (row) => num(row.balance) },
    { key: 'status', label: t('pettyCash.columns.status'), render: (row) => <Chip tone={row.tone}>{row.status}</Chip> },
    {
      align: 'end', key: 'settle', label: '',
      render: () => (
        <button className={rowActionButtonClass} type="button">
          <Plus aria-hidden="true" size={13} />
          {t('pettyCash.actions.settleRequest')}
        </button>
      ),
    },
  ];
}
