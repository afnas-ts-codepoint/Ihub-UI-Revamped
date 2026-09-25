import { Check, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  RecordExportDefinition,
  RecordFilterKind,
  RecordFilterValue,
} from './filter.types';
import { createEmptyRecordFilter } from './filter.types';
import { useReferenceFilters } from './hooks/useReferenceFilters';
import { RecordExport } from './RecordExport';
import type { AppliedFilter } from '@/shared/filter/filter.types';
import { FilterBar } from '@/shared/filter/FilterBar';
import { FilterDialog } from '@/shared/filter/FilterDialog';
import { DateRangeField } from '@/shared/form/controls/DateRangeField';
import { MultiSelectChips } from '@/shared/form/controls/MultiSelectChips';
import { Select, type SelectOption } from '@/shared/form/controls/Select';
import { Field } from '@/shared/form/field/Field';
import { DialogFooter } from '@/shared/ui/overlay/Dialog';

type RecordFilterProps = Readonly<{
  activities?: readonly string[];
  afterExport?: ReactNode;
  bare?: boolean;
  departments?: readonly string[];
  exportDefinition?: RecordExportDefinition;
  hideChips?: boolean;
  kind?: RecordFilterKind;
  locations?: readonly string[];
  midActions?: ReactNode;
  noExport?: boolean;
  noMargin?: boolean;
  onChange: (value: RecordFilterValue) => void;
  value: RecordFilterValue;
  zones?: readonly string[];
}>;

const option = (value: string): SelectOption => ({ label: value, value });

function FilterGroup({
  children,
  hint,
  title,
}: Readonly<{ children: ReactNode; hint?: string; title: string }>) {
  return (
    <section className="flex flex-col gap-2.5">
      <header className="flex flex-wrap items-baseline gap-2">
        <h3 className="m-0 text-sm-plus font-bold text-fg">{title}</h3>
        {hint ? <p className="m-0 text-xs-plus text-fg-3">{hint}</p> : null}
      </header>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
        {children}
      </div>
    </section>
  );
}

const arrayKeys = ['locations', 'zones', 'matrix', 'assignees'] as const;
type ArrayKey = (typeof arrayKeys)[number];
type ScalarKey =
  | 'activity'
  | 'cat'
  | 'dept'
  | 'from'
  | 'origin'
  | 'priority'
  | 'risk'
  | 'status'
  | 'sub'
  | 'to';

/** @prototype index.html:L1577-L1727 */
export function RecordFilter({
  activities,
  afterExport,
  bare,
  departments,
  exportDefinition,
  hideChips,
  kind = 'incident',
  locations,
  midActions,
  noExport,
  noMargin,
  onChange,
  value,
  zones,
}: RecordFilterProps) {
  const { t } = useTranslation('organization');
  const { data } = useReferenceFilters();
  const meta = data.kinds[kind];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const departmentOptions = departments ?? data.departments;
  const hasPriority = meta.extras.some((extra) => extra.key === 'priority');
  const scalarKeys = [
    'dept',
    'origin',
    'activity',
    'cat',
    'sub',
    'from',
    'to',
    ...(hasPriority ? [] : (['priority'] as const)),
    ...meta.extras.map((extra) => extra.key),
  ].filter(
    (key, index, keys): key is ScalarKey => keys.indexOf(key) === index,
  );

  const updateDraft = (patch: Partial<RecordFilterValue>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };
  const count = (filter: RecordFilterValue) =>
    (filter.num ? 1 : 0) +
    arrayKeys.reduce((total, key) => total + filter[key].length, 0) +
    filter.flags.length +
    scalarKeys.filter((key) => filter[key]).length;

  const labelForScalar = (key: ScalarKey) => {
    const extra = meta.extras.find((item) => item.key === key);
    if (extra) return t(extra.labelKey, { defaultValue: extra.labelKey });
    if (key === 'cat')
      return kind === 'history' ? t('fields.action') : t('fields.category');
    if (key === 'sub')
      return kind === 'history' ? t('fields.scope') : t('fields.subcategory');
    const keys: Record<Exclude<ScalarKey, 'cat' | 'sub'>, string> = {
      activity: 'fields.activity',
      dept: 'fields.owner',
      from: 'fields.from',
      origin: 'fields.origin',
      priority: 'fields.priority',
      risk: 'fields.risk',
      status: 'fields.status',
      to: 'fields.to',
    };
    return t(keys[key], { defaultValue: keys[key] });
  };

  const clear = () => {
    const empty = createEmptyRecordFilter();
    setDraft(empty);
    onChange(empty);
  };

  const appliedFilters = (() => {
    const filters: AppliedFilter[] = [];
    if (value.num) {
      filters.push({
        id: 'num',
        label: t('fields.search'),
        value: value.num,
        onRemove: () => { onChange({ ...value, num: '' }); },
      });
    }
    const labels: Record<ArrayKey, string> = {
      assignees: t('fields.assignee'),
      locations: t('fields.location'),
      matrix: t('fields.matrix'),
      zones: t('fields.zone'),
    };
    arrayKeys.forEach((key) => { value[key].forEach((selected) =>
        filters.push({
          id: `${key}-${selected}`,
          label: labels[key],
          value: selected,
          onRemove: () => { onChange({
              ...value,
              [key]: value[key].filter((item) => item !== selected),
            }); },
        }),
      ); },
    );
    scalarKeys.forEach((key) => {
      if (value[key]) {
        filters.push({
          id: key,
          label: labelForScalar(key),
          value: value[key],
          onRemove: () => { onChange({ ...value, [key]: '' }); },
        });
      }
    });
    value.flags.forEach((flagId) => {
      const flag = data.flags.find((item) => item.id === flagId);
      if (flag) {
        filters.push({
          id: `flag-${flagId}`,
          label: t('fields.flag'),
          value: t(flag.labelKey, { defaultValue: flag.labelKey }),
          onRemove: () => { onChange({
              ...value,
              flags: value.flags.filter((item) => item !== flagId),
            }); },
        });
      }
    });
    return filters;
  })();

  const selectField = (
    key: ScalarKey,
    label: string,
    options: readonly string[],
    placeholder = t('fields.any'),
  ) => (
    <Field key={key} label={label}>
      <Select
        ariaLabel={label}
        onChange={(selected) => { updateDraft({ [key]: selected }); }}
        options={options.map(option)}
        placeholder={placeholder}
        value={draft[key]}
      />
    </Field>
  );

  const multiField = (
    key: ArrayKey,
    label: string,
    options: readonly string[],
  ) => (
    <Field key={key} label={label}>
      <MultiSelectChips
        ariaLabel={label}
        onChange={(selected) => { updateDraft({ [key]: selected }); }}
        options={options.map(option)}
        value={draft[key]}
      />
    </Field>
  );

  return (
    <>
      <FilterBar
        activeCount={count(value)}
        appliedFilters={appliedFilters}
        appliedLabel={t('bar.applied')}
        bare={bare}
        clearAllLabel={t('actions.clearAll')}
        exportSlot={
          noExport ? null : (
            <RecordExport compact definition={exportDefinition} kind={kind} />
          )
        }
        filterLabel={t('bar.filters')}
        hideChips={hideChips}
        midActions={midActions}
        noMargin={noMargin}
        onClear={clear}
        onOpen={() => {
          setDraft(value);
          setOpen(true);
        }}
        onSearchChange={(num) => { onChange({ ...value, num }); }}
        removeLabel={t('actions.remove')}
        searchPlaceholder={`${meta.placeholder}${t('bar.subjectSuffix')}`}
        searchValue={value.num}
      />
      {afterExport}
      <FilterDialog
        closeLabel={t('actions.close')}
        description={t('dialog.description')}
        footer={
          <DialogFooter>
            <button
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-2 hover:bg-surface"
              onClick={clear}
              type="button"
            >
              {t('actions.clearAllFilters')}
            </button>
            <span className="text-sm text-fg-3">
              {count(draft)
                ? t('dialog.selected', { count: count(draft) })
                : t('dialog.nothingSelected')}
            </span>
            <div className="ms-auto flex gap-2">
              <button
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-2 hover:bg-surface"
                onClick={() => { setOpen(false); }}
                type="button"
              >
                {t('actions.cancel')}
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink"
                onClick={() => {
                  onChange(draft);
                  setOpen(false);
                }}
                type="button"
              >
                <Check aria-hidden="true" size={13} />
                {t('actions.apply')}
              </button>
            </div>
          </DialogFooter>
        }
        onOpenChange={setOpen}
        open={open}
        title={t('dialog.title')}
      >
        <FilterGroup hint={t('groups.quickHint')} title={t('groups.quick')}>
          <div className="col-span-full flex flex-wrap gap-2">
            {data.flags.map((flag) => {
              const selected = draft.flags.includes(flag.id);
              return (
                <button
                  aria-pressed={selected}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-sm-plus font-medium text-fg-2 data-[selected=true]:border-accent/30 data-[selected=true]:bg-accent-dim data-[selected=true]:font-semibold data-[selected=true]:text-accent"
                  data-selected={selected}
                  key={flag.id}
                  onClick={() => { updateDraft({
                      flags: selected
                        ? draft.flags.filter((item) => item !== flag.id)
                        : [...draft.flags, flag.id],
                    }); }
                  }
                  type="button"
                >
                  {selected ? <Check aria-hidden="true" size={12} /> : null}
                  {t(flag.labelKey, { defaultValue: flag.labelKey })}
                </button>
              );
            })}
          </div>
        </FilterGroup>
        <FilterGroup hint={t('groups.recordHint')} title={t('groups.record')}>
          <Field
            label={t('fields.subjectNumber', {
              number: t(meta.numberLabelKey, {
                defaultValue: meta.numberLabelKey,
              }),
            })}
          >
            <div className="flex items-center gap-2 rounded-menu border border-line-strong bg-canvas px-3">
              <Search aria-hidden="true" className="text-fg-4" size={14} />
              <input
                className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-fg outline-none"
                onChange={(event) => { updateDraft({ num: event.target.value }); }}
                placeholder={`${meta.placeholder}${t('bar.subjectSuffix')}`}
                value={draft.num}
              />
            </div>
          </Field>
          {selectField('dept', t('fields.owner'), departmentOptions)}
          {multiField('assignees', t('fields.assignee'), data.assignees)}
          {selectField('origin', t('fields.origin'), departmentOptions)}
          {multiField('matrix', t('fields.matrixPartner'), departmentOptions)}
        </FilterGroup>
        <FilterGroup hint={t('groups.whereHint')} title={t('groups.where')}>
          {multiField('locations', t('fields.locations'), locations ?? data.locations)}
          {multiField('zones', t('fields.zones'), zones ?? data.zones)}
          {selectField('activity', t('fields.activity'), activities ?? data.zones)}
        </FilterGroup>
        <FilterGroup title={t('groups.classification')}>
          {selectField(
            'cat',
            kind === 'history' ? t('fields.action') : t('fields.category'),
            meta.categories,
          )}
          {selectField(
            'sub',
            kind === 'history' ? t('fields.scope') : t('fields.subcategory'),
            meta.subcategories,
          )}
          {!hasPriority
            ? selectField(
                'priority',
                t('fields.priority'),
                data.priorities,
                t('fields.anyPriority'),
              )
            : null}
          {meta.extras.map((extra) =>
            selectField(
              extra.key,
              t(extra.labelKey, { defaultValue: extra.labelKey }),
              extra.options,
            ),
          )}
        </FilterGroup>
        <FilterGroup title={t('groups.dateRange')}>
          <div className="col-span-full">
            <DateRangeField
              onChange={({ from, to }) => { updateDraft({ from, to }); }}
              value={{ from: draft.from, to: draft.to }}
            />
          </div>
        </FilterGroup>
      </FilterDialog>
    </>
  );
}
