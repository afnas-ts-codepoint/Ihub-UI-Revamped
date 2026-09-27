import { Plus, Trash2 } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';

type Props<TRow> = Readonly<{
  addLabel: string;
  onAdd: () => void;
  onRemove?: (index: number) => void;
  removeLabel: string;
  renderRow: (row: TRow, index: number, removeButton: ReactNode) => ReactNode;
  rows: readonly TRow[];
}>;

export function RepeatableRows<TRow>({
  addLabel,
  onAdd,
  onRemove,
  removeLabel,
  renderRow,
  rows,
}: Props<TRow>) {
  return (
    <>
      {rows.map((row, index) => (
        <Fragment key={index}>
          {renderRow(
          row,
          index,
          onRemove && rows.length > 1 ? (
            <button
              aria-label={removeLabel}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-bad hover:bg-bad/10"
              onClick={() => { onRemove(index); }}
              title={removeLabel}
              type="button"
            >
              <Trash2 aria-hidden="true" size={14} />
            </button>
          ) : null,
          )}
        </Fragment>
      ))}
      <button
        className="inline-flex w-fit items-center gap-2 py-0.5 text-sm-plus font-bold text-accent"
        onClick={onAdd}
        type="button"
      >
        <Plus aria-hidden="true" size={15} />
        {addLabel}
      </button>
    </>
  );
}
