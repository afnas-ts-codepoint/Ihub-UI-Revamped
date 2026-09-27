import { Folder, Pencil } from 'lucide-react';

import type { TableColumn } from '@/shared/table';
import { Chip } from '@/shared/ui/chip/Chip';

import type {
  MissingDocumentRow,
  PurchaseHistoryRow,
  PurchaseOrderHistoryRow,
  PurchaseOrderRow,
  PurchaseRequestRow,
} from '../types/purchasing.types';
import { rowActionButtonClass } from './purchasingButtonStyles';

/**
 * Column headers and tab labels for the Pending/Edit/Missing/History/To Do
 * segments stay literal English, matching the prototype's unwrapped string
 * literals (only the functional Review view's columns are translated).
 * @prototype index.html:L10036-L10069
 */
export const purchaseRequestColumns: readonly TableColumn<PurchaseRequestRow>[] = [
  { key: 'id', label: 'PC #' },
  { key: 'title', label: 'Request', wrap: true },
  { key: 'vendor', label: 'Vendor', muted: true },
  { key: 'dept', label: 'Department', muted: true },
  {
    align: 'end', key: 'value', label: 'Value (KWD)',
    render: (row) => <span className="num font-semibold">{row.value}</span>,
  },
  { key: 'submitted', label: 'Submitted', muted: true },
  {
    key: 'status', label: 'Status',
    render: (row) => <Chip tone={row.tone}>{row.status}</Chip>,
  },
];

/** @prototype index.html:L10153 `editCols`; L10150-L10152 `reqActBtn` (inert — `PROTOTYPE-NOOP(D2)`). */
export function editRequestColumns(editLabel: string): readonly TableColumn<PurchaseRequestRow>[] {
  return [
    ...purchaseRequestColumns,
    {
      align: 'end', key: 'act', label: '',
      render: () => (
        <button className={rowActionButtonClass} type="button">
          <Pencil aria-hidden="true" size={13} />
          {editLabel}
        </button>
      ),
    },
  ];
}

/** @prototype index.html:L10156-L10162 `reqMissCols` */
export const missingDocumentColumns: readonly TableColumn<MissingDocumentRow>[] = [
  { key: 'id', label: 'PC #' },
  { key: 'title', label: 'Request', wrap: true },
  {
    key: 'missing', label: 'Missing',
    render: (row) => (
      <div className="flex flex-wrap gap-1.5">
        {row.missing.map((item) => (
          <Chip key={item} tone="bad">{item}</Chip>
        ))}
      </div>
    ),
  },
  { key: 'vendor', label: 'Vendor', muted: true },
  {
    align: 'end', key: 'days', label: 'Days pending',
    render: (row) => <span className="num font-semibold">{row.days}</span>,
  },
];

/** @prototype index.html:L10168-L10174 `reqHistCols` */
export const purchaseHistoryColumns: readonly TableColumn<PurchaseHistoryRow>[] = [
  { key: 'date', label: 'Date', muted: true },
  {
    key: 'id', label: 'PC #',
    render: (row) => <span className="num font-semibold">{row.id}</span>,
  },
  {
    key: 'action', label: 'Action',
    render: (row) => <Chip tone={row.tone}>{row.action}</Chip>,
  },
  { key: 'by', label: 'By', muted: true },
  { key: 'note', label: 'Note', muted: true, wrap: true },
];

/**
 * The row action seeds a brand-new `PoAttachSeed` object on every click
 * (`index.html:L10140`), including re-clicking the same row — there is no
 * reused/mutated draft object.
 * @prototype index.html:L10125-L10143 `poCols`
 */
export function purchaseOrderColumns(
  attachLabel: string,
  onAttach: (row: PurchaseOrderRow) => void,
): readonly TableColumn<PurchaseOrderRow>[] {
  return [
    { key: 'id', label: 'PO #' },
    { key: 'supplier', label: 'Supplier', wrap: true },
    { key: 'ref', label: 'PC Ref', muted: true },
    {
      align: 'end', key: 'value', label: 'Value (KWD)',
      render: (row) => <span className="num font-semibold">{row.value}</span>,
    },
    { key: 'issued', label: 'Issued', muted: true },
    { key: 'status', label: 'Status', render: (row) => <Chip tone={row.tone}>{row.status}</Chip> },
    {
      align: 'end', key: 'act', label: '',
      render: (row) => (
        <button className={rowActionButtonClass} onClick={() => { onAttach(row); }} type="button">
          <Folder aria-hidden="true" size={13} />
          {attachLabel}
        </button>
      ),
    },
  ];
}

/** @prototype index.html:L10325-L10331 `poHistCols` */
export const purchaseOrderHistoryColumns: readonly TableColumn<PurchaseOrderHistoryRow>[] = [
  { key: 'date', label: 'Date', muted: true },
  {
    key: 'id', label: 'PO #',
    render: (row) => <span className="num font-semibold">{row.id}</span>,
  },
  {
    key: 'action', label: 'Action',
    render: (row) => <Chip tone={row.tone}>{row.action}</Chip>,
  },
  { key: 'by', label: 'By', muted: true },
  { key: 'note', label: 'Note', muted: true, wrap: true },
];
