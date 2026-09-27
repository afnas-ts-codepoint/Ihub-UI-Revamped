import { Check } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { TFunction } from 'i18next';

import {
  AA_AREA_NAMES,
  AA_LOCATIONS,
  aaZonesFor,
  MASTER_FILTER_OPTIONS,
  SA_SUB_NAMES,
  TM_OPTIONS,
} from '../data/seedRows';
import type {
  MasterDefinition,
  MasterFilterFieldId,
  MasterFilterValue,
  MasterStatus,
} from '../domain/types';
import { FilterDialog } from '@/shared/filter/FilterDialog';
import { DateField } from '@/shared/form/controls/DateField';
import { Select, type SelectOption } from '@/shared/form/controls/Select';
import { TextInput } from '@/shared/form/controls/TextInput';
import { Field } from '@/shared/form/field/Field';
import { cn } from '@/shared/lib/cn';
import { DialogFooter } from '@/shared/ui/overlay/Dialog';

type MasterFilterDialogProps = Readonly<{
  definition: MasterDefinition;
  fieldVisibility: Readonly<Record<string, boolean>>;
  onApply: (value: MasterFilterValue) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  t: TFunction<'masters'>;
  value: MasterFilterValue;
}>;

const options = (values: readonly string[]): SelectOption[] =>
  values.map((value) => ({ label: value, value }));

/**
 * Mode-specific "Filter records" dialog, ported field-for-field from
 * `MasterFilterModal`, reusing the shared `FilterDialog` chrome.
 * @prototype index.html:L3633-L3731
 */
export function MasterFilterDialog({
  definition,
  fieldVisibility,
  onApply,
  onOpenChange,
  open,
  t,
  value,
}: MasterFilterDialogProps) {
  const [draft, setDraft] = useState<MasterFilterValue>(value);
  // Re-seed the draft from the committed value each time the dialog opens,
  // mirroring the prototype's `useEffect(() => { if (open) setDraft(value) },
  // [open, value])` — done during render (React's "adjusting state when a
  // prop changes" pattern) rather than in an effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(value);
  }

  const isVisible = (id: string) => fieldVisibility[id] !== false;
  const set = (patch: MasterFilterValue) => {
    setDraft((current) => ({ ...current, ...patch }));
  };
  const any = t('filterDialog.any');
  const mode = definition.mode;
  /** Every field/hint label key is a runtime string built from domain data, not a literal. */
  const tr = (key: string) => t(key, { defaultValue: key });

  const selectedCount = definition.filterFields.filter(
    (field) => draft[field.id],
  ).length;

  const dateInput = (id: 'fromDate' | 'toDate', labelKey: string): ReactNode =>
    isVisible(id) ? (
      <Field key={id} label={tr(labelKey)}>
        <TextInput
          aria-label={tr(labelKey)}
          onChange={(event) => {
            set({ [id]: event.target.value });
          }}
          type="date"
          value={draft[id] ?? ''}
        />
      </Field>
    ) : null;

  const brandedDate = (
    id: 'createdOn' | 'updatedOn',
    labelKey: string,
  ): ReactNode =>
    isVisible(id) ? (
      <Field key={id} label={tr(labelKey)}>
        <DateField
          ariaLabel={tr(labelKey)}
          onChange={(next) => {
            set({ [id]: next });
          }}
          value={draft[id] ?? ''}
        />
      </Field>
    ) : null;

  const selectInput = (
    id: MasterFilterFieldId,
    labelKey: string,
    values: readonly string[],
    onChangeExtra?: () => Partial<MasterFilterValue>,
  ): ReactNode =>
    isVisible(id) ? (
      <Field key={id} label={tr(labelKey)}>
        <Select
          ariaLabel={tr(labelKey)}
          onChange={(next) => {
            set({ [id]: next, ...onChangeExtra?.() });
          }}
          options={options(values)}
          placeholder={any}
          value={draft[id] ?? ''}
        />
      </Field>
    ) : null;

  const fields: ReactNode[] = [];
  if (mode === 'pc') {
    if (isVisible('name')) {
      fields.push(
        <Field key="name" label={t('fields.name')}>
          <TextInput
            aria-label={t('fields.name')}
            onChange={(event) => {
              set({ name: event.target.value });
            }}
            placeholder={t('fields.namePlaceholder')}
            value={draft.name ?? ''}
          />
        </Field>,
      );
    }
    fields.push(dateInput('fromDate', 'fields.fromDate'));
    fields.push(dateInput('toDate', 'fields.toDate'));
  } else if (mode === 'tm') {
    fields.push(
      selectInput('locations', 'fields.location', AA_LOCATIONS, () => ({
        zones: '',
      })),
    );
    fields.push(
      selectInput('zones', 'fields.zone', aaZonesFor(draft.locations)),
    );
    fields.push(selectInput('area', 'fields.area', TM_OPTIONS.areas));
    fields.push(selectInput('subArea', 'fields.subArea', TM_OPTIONS.subAreas));
    fields.push(
      selectInput('touchPoint', 'fields.touchPoint', TM_OPTIONS.touchPoints),
    );
    fields.push(selectInput('dept', 'fields.dept', TM_OPTIONS.departments));
    fields.push(
      selectInput(
        'applicableFor',
        'fields.applicableFor',
        TM_OPTIONS.applicableFor,
      ),
    );
    fields.push(dateInput('fromDate', 'fields.fromDate'));
    fields.push(dateInput('toDate', 'fields.toDate'));
  } else if (mode === 'aa' || mode === 'sa') {
    fields.push(
      selectInput('locations', 'fields.location', AA_LOCATIONS, () => ({
        zones: '',
      })),
    );
    fields.push(
      selectInput('zones', 'fields.zone', aaZonesFor(draft.locations)),
    );
    if (mode === 'sa') {
      fields.push(
        selectInput('assignmentArea', 'fields.assignmentArea', AA_AREA_NAMES),
      );
      fields.push(selectInput('subAreaName', 'fields.subArea', SA_SUB_NAMES));
    }
    fields.push(dateInput('fromDate', 'fields.fromDate'));
    fields.push(dateInput('toDate', 'fields.toDate'));
  } else {
    fields.push(
      selectInput(
        'locations',
        'fields.allLocations',
        MASTER_FILTER_OPTIONS.locations,
      ),
    );
    fields.push(
      selectInput('zones', 'fields.allZones', MASTER_FILTER_OPTIONS.zones),
    );
    fields.push(brandedDate('createdOn', 'fields.createdOn'));
    fields.push(brandedDate('updatedOn', 'fields.updatedOn'));
    fields.push(
      selectInput('createdBy', 'fields.createdBy', MASTER_FILTER_OPTIONS.users),
    );
    fields.push(
      selectInput('updatedBy', 'fields.updatedBy', MASTER_FILTER_OPTIONS.users),
    );
  }

  const showStatusSegment =
    mode !== 'aa' && mode !== 'sa' && isVisible('status');
  const hintKey =
    mode === 'pc'
      ? 'pc'
      : mode === 'sa'
        ? 'sa'
        : mode === 'aa'
          ? 'aa'
          : mode === 'tm'
            ? 'tm'
            : 'generic';

  return (
    <FilterDialog
      closeLabel={t('filterDialog.close')}
      description={t('filterDialog.description')}
      footer={
        <DialogFooter>
          <button
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-2 hover:bg-surface"
            onClick={() => {
              setDraft({});
              onApply({});
            }}
            type="button"
          >
            {t('filterDialog.clearAll')}
          </button>
          <span className="text-sm text-fg-3">
            {selectedCount
              ? t(
                  selectedCount === 1
                    ? 'filterDialog.selectedCountOne'
                    : 'filterDialog.selectedCountOther',
                  { count: selectedCount },
                )
              : t('filterDialog.nothingSelected')}
          </span>
          <div className="ms-auto flex gap-2">
            <button
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-2 hover:bg-surface"
              onClick={() => {
                onOpenChange(false);
              }}
              type="button"
            >
              {t('filterDialog.cancel')}
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink"
              onClick={() => {
                onApply(draft);
                onOpenChange(false);
              }}
              type="button"
            >
              <Check aria-hidden="true" size={13} />
              {t('filterDialog.apply')}
            </button>
          </div>
        </DialogFooter>
      }
      onOpenChange={onOpenChange}
      open={open}
      title={t('filterDialog.title')}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm-plus font-bold text-fg">
            {t('filterDialog.recordLabel')}
          </span>
          <span className="text-xs-plus text-fg-3">
            {tr(`filterDialog.recordHint.${hintKey}`)}
          </span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
          {fields}
        </div>
      </div>
      {showStatusSegment ? (
        <div className="flex flex-col gap-2">
          <span className="text-2xs-plus font-semibold tracking-wide text-fg-3 uppercase">
            {t('fields.status')}
          </span>
          <div className="inline-flex w-fit gap-0.5 rounded-lg border border-line bg-canvas p-0.75">
            {(
              ['active', 'inactive'] as const satisfies readonly MasterStatus[]
            ).map((id) => {
              const on = draft.status === id;
              return (
                <button
                  className={cn(
                    'rounded-menu px-4.5 py-1.5 text-sm font-medium',
                    on
                      ? 'shadow-sm bg-surface font-bold text-accent'
                      : 'text-fg-2',
                  )}
                  key={id}
                  onClick={() => {
                    set({ status: on ? '' : id });
                  }}
                  type="button"
                >
                  {t(`fields.${id}`)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </FilterDialog>
  );
}
