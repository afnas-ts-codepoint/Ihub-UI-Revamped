import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkAreaDialog } from './WorkAreaDialog';
import { cardClass, primaryButton, priorityDotClass } from './sla.styles';
import { filterWorkAreaMappings } from '../domain/sla';
import type {
  SlaPriorityId,
  WorkAreaFormValues,
  WorkAreaMapping as Mapping,
} from '../types/sla.types';
import { TextInput } from '@/shared/form/controls/TextInput';
import { cn } from '@/shared/lib/cn';

type Props = Readonly<{
  mappings: readonly Mapping[];
  onRemove: (id: string) => void;
  onSave: (id: string | null, values: WorkAreaFormValues) => void;
}>;
const filters: readonly ('all' | SlaPriorityId)[] = [
  'all',
  'P1',
  'P2',
  'P3',
  'P4',
];
export function WorkAreaMapping({ mappings, onRemove, onSave }: Props) {
  const { t } = useTranslation('sla');
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState<(typeof filters)[number]>('all');
  const [dialog, setDialog] = useState<{
    mode: 'add' | 'edit';
    mapping: Mapping | null;
  } | null>(null);
  const rows = useMemo(
    () => filterWorkAreaMappings(mappings, query, priority),
    [mappings, priority, query],
  );
  return (
    <div className="flex flex-col gap-4" data-testid="work-area-mapping">
      <p className="m-0 text-base leading-relaxed text-fg-3">
        {t('mapping.description')}
      </p>
      <div className={cardClass}>
        <div className="flex flex-wrap items-center gap-2.5">
          <TextInput
            aria-label={t('mapping.search')}
            className="min-w-[220px] flex-1"
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={t('mapping.search')}
            value={query}
          />
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => (
              <button
                aria-pressed={priority === filter}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm-plus font-semibold',
                  priority === filter
                    ? 'text-white border-accent bg-accent'
                    : 'border-line-strong bg-surface text-fg-2',
                )}
                key={filter}
                onClick={() => {
                  setPriority(filter);
                }}
                type="button"
              >
                {t(`priorities.${filter}`)}
              </button>
            ))}
          </div>
          <button
            className={cn(primaryButton, 'ms-auto')}
            onClick={() => {
              setDialog({ mode: 'add', mapping: null });
            }}
            type="button"
          >
            <Plus aria-hidden="true" size={14} />
            {t('actions.add')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-base">
            <thead>
              <tr>
                {(
                  [
                    'area',
                    'priority',
                    'response',
                    'resolution',
                    'conditional',
                  ] as const
                ).map((key) => (
                  <th
                    className="px-2 pb-2.5 text-start text-xs font-semibold tracking-wider whitespace-nowrap text-fg-3 uppercase"
                    key={key}
                  >
                    {t(`mapping.columns.${key}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr
                    className="cursor-pointer border-t border-line hover:bg-inset focus-visible:bg-inset focus-visible:outline-2 focus-visible:outline-accent"
                    key={row.id}
                    onClick={() => {
                      setDialog({ mode: 'edit', mapping: row });
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setDialog({ mode: 'edit', mapping: row });
                      }
                    }}
                    tabIndex={0}
                    title={t('mapping.editRule')}
                  >
                    <td className="min-w-[150px] px-2 py-3 font-semibold">
                      {row.area}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <span
                          className={cn(
                            'size-2 rounded-full',
                            priorityDotClass[row.priorities[0] ?? 'P3'],
                          )}
                        />
                        {row.priorities
                          .map((value) => t(`priorities.${value}`))
                          .join(' / ')}
                      </span>
                    </td>
                    <td className="min-w-[120px] px-2 py-3 text-fg-2">
                      {row.response}
                    </td>
                    <td className="min-w-[130px] px-2 py-3 text-fg-2">
                      {row.resolution}
                    </td>
                    <td className="px-2 py-3 text-fg-3">{row.conditional}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-2 py-6 text-center text-base text-fg-3"
                    colSpan={5}
                  >
                    {t('mapping.noMatches')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {dialog ? (
        <WorkAreaDialog
          key={dialog.mapping?.id ?? 'new'}
          mapping={dialog.mapping}
          mode={dialog.mode}
          onClose={() => {
            setDialog(null);
          }}
          onRemove={onRemove}
          onSave={onSave}
        />
      ) : null}
    </div>
  );
}
