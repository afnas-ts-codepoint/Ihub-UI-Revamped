import type { TFunction } from 'i18next';

import type { MasterFormValues } from '../domain/formValues';
import type { MasterMode, MasterRow } from '../domain/types';
import { retainCompatibleZones, zonesForLocations } from '../domain/zonesForLocation';
import {
  AA_AREA_NAMES,
  AA_LOCATIONS,
  AA_ZONES,
  MASTER_ADD_OPTIONS,
  TM_OPTIONS,
  TM_PRIORITIES,
  TM_SEVERITIES,
  aaZonesFor,
} from '../data/seedRows';
import { Checkbox } from '@/shared/form/controls/Checkbox';
import { MultiSelectChips } from '@/shared/form/controls/MultiSelectChips';
import { SegmentedRadio } from '@/shared/form/controls/SegmentedRadio';
import { Select, type SelectOption } from '@/shared/form/controls/Select';
import { SwatchRadio } from '@/shared/form/controls/SwatchRadio';
import { TextInput } from '@/shared/form/controls/TextInput';
import { Field } from '@/shared/form/field/Field';
import { FormGrid } from '@/shared/form/layout/FormGrid';
import { Chip } from '@/shared/ui/chip/Chip';

const options = (values: readonly string[]): SelectOption[] =>
  values.map((value) => ({ label: value, value }));

type Props = Readonly<{
  mode: 'edit' | 'view';
  masterMode: MasterMode;
  onChange: (patch: Partial<MasterFormValues>) => void;
  record: MasterRow;
  t: TFunction<'masters'>;
  values: MasterFormValues;
}>;

function ViewValue({ children }: Readonly<{ children?: React.ReactNode }>) {
  return <div className="min-h-9.5 py-2.25 text-base text-fg">{children || '—'}</div>;
}

function Card({ children }: Readonly<{ children: React.ReactNode }>) {
  return <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-4.5">{children}</section>;
}

export function MasterRecordFields({ mode, masterMode, onChange, record, t, values }: Props) {
  const view = mode === 'view';
  const severityLabel = (value: string) => value === 'low'
    ? t('form.severity.low')
    : value === 'medium' ? t('form.severity.medium') : t('form.severity.high');
  const priorityLabel = (value: string) => value === 'low'
    ? t('form.priority.low')
    : value === 'medium' ? t('form.priority.medium') : t('form.priority.high');
  const text = (key: keyof MasterFormValues, placeholder: string, required = false) => (
    <Field id={`master-${key}`} label={t(`form.fields.${key}`)} required={!view && required}>
      {view ? <ViewValue>{String(values[key] || '')}</ViewValue> : (
        <TextInput
          id={`master-${key}`}
          onChange={(event) => { onChange({ [key]: event.target.value }); }}
          placeholder={placeholder}
          value={String(values[key] || '')}
        />
      )}
    </Field>
  );
  const select = (
    key: keyof MasterFormValues,
    list: readonly string[],
    placeholder = t('form.select'),
    required = false,
    pick?: (value: string) => void,
  ) => {
    const current = String(values[key] || '');
    const available = current && !list.includes(current) ? [current, ...list] : list;
    return (
      <Field label={t(`form.fields.${key}`)} required={!view && required}>
        {view ? <ViewValue>{current}</ViewValue> : (
          <Select
            ariaLabel={t(`form.fields.${key}`)}
            onChange={pick ?? ((value) => { onChange({ [key]: value }); })}
            options={options(available)}
            placeholder={placeholder}
            value={current}
          />
        )}
      </Field>
    );
  };
  const multi = (
    key: 'areas' | 'locations' | 'matrixList' | 'subAreas' | 'zones',
    list: readonly string[],
    placeholder: string,
    required = false,
    pick?: (value: readonly string[]) => void,
    hint?: string,
  ) => (
    <Field label={t(`form.fields.${key}`)} required={!view && required}>
      {view ? <ViewValue>{values[key].join(', ')}</ViewValue> : (
        <><MultiSelectChips ariaLabel={t(`form.fields.${key}`)} onChange={pick ?? ((value) => { onChange({ [key]: [...value] }); })} options={options(list)} placeholder={placeholder} value={values[key]} />{hint ? <span className="text-xs-plus text-fg-3">{hint}</span> : null}</>
      )}
    </Field>
  );
  const meta = view ? (
    <Card>
      <FormGrid>
        <Field label={t('form.fields.createdOn')}><ViewValue>{record.createdOn}</ViewValue></Field>
        <Field label={t('form.fields.status')}>
          <ViewValue><Chip tone={record.status === 'active' ? 'ok' : 'neutral'}>{t(`chips.${record.status}`)}</Chip></ViewValue>
        </Field>
      </FormGrid>
    </Card>
  ) : <p className="m-0 text-xs-plus text-fg-3">{t('form.statusNote')}</p>;

  if (masterMode === 'pc') return <>{<Card><FormGrid>{text('name', t('form.placeholders.name'), true)}</FormGrid></Card>}{meta}</>;

  if (masterMode === 'sa') return <>
    <Card><FormGrid columns={3}>
      {select('location', AA_LOCATIONS, t('form.placeholders.location'), true, (location) => { onChange({ location, zone: '' }); })}
      {select('zone', aaZonesFor(values.location), t('form.placeholders.zone'), true)}
      {select('assignmentArea', AA_AREA_NAMES, t('form.placeholders.assignmentArea'), true)}
    </FormGrid></Card>
    <Card><h3 className="m-0 text-sm font-semibold text-fg-3">{t('form.sections.subAreas')}</h3><FormGrid>{text('name', t('form.placeholders.subArea'), true)}</FormGrid></Card>
    {meta}
  </>;

  if (masterMode === 'aa') return <>
    <Card><FormGrid>
      {select('location', AA_LOCATIONS, t('form.placeholders.location'), true, (location) => { onChange({ location, zone: '' }); })}
      {select('zone', aaZonesFor(values.location), t('form.placeholders.zone'), true)}
    </FormGrid></Card>
    <Card><h3 className="m-0 text-sm font-semibold text-fg-3">{t('form.sections.areas')}</h3>
      {view ? <FormGrid columns={3}>{text('name', '', true)}<Field label={t('form.fields.snagType')}><ViewValue>{values.snagType ? t('form.yes') : t('form.no')}</ViewValue></Field></FormGrid>
        : <FormGrid columns={3}><div className="flex flex-wrap items-end gap-3"><div className="min-w-35 flex-1">{text('name', t('form.placeholders.areaName'), true)}</div><Checkbox checked={values.snagType} label={t('form.fields.snagType')} onChange={(snagType) => { onChange({ snagType }); }} /></div></FormGrid>}
    </Card>{meta}
  </>;

  if (masterMode === 'tm') {
    const zoneOptions = values.locations.length ? zonesForLocations(values.locations) : [...AA_ZONES];
    return <>
      <Card><FormGrid>
        {multi('locations', AA_LOCATIONS, t('form.select'), true, (locations) => { onChange({ locations: [...locations], zones: retainCompatibleZones(locations, values.zones) }); })}
        {multi('zones', zoneOptions, t('form.select'), true)}
        {multi('areas', TM_OPTIONS.areas, t('form.placeholders.addArea'), true, undefined, t('form.subAreaNote'))}
        {multi('subAreas', TM_OPTIONS.subAreas, t('form.placeholders.addSubArea'), true)}
        {select('touchPoint', TM_OPTIONS.touchPoints)}
      </FormGrid></Card>
      <Card><FormGrid>
        {select('dept', TM_OPTIONS.departments, t('form.select'), true)}
        {multi('matrixList', TM_OPTIONS.matrixPartners, t('form.placeholders.addPartner'))}
        {select('applicableFor', TM_OPTIONS.applicableFor)}
        <Field label={t('form.fields.severity')}>{view ? <ViewValue>{values.severity ? severityLabel(values.severity) : ''}</ViewValue> : <SwatchRadio ariaLabel={t('form.fields.severity')} onChange={(severity) => { onChange({ severity }); }} options={TM_SEVERITIES.map((value) => ({ colorClass: value === 'low' ? 'bg-ok' : value === 'medium' ? 'bg-[var(--brand-yellow)]' : 'bg-bad', label: severityLabel(value), value }))} value={values.severity} />}</Field>
        <Field label={t('form.fields.priority')}>{view ? <ViewValue>{values.priority ? priorityLabel(values.priority) : ''}</ViewValue> : <SegmentedRadio ariaLabel={t('form.fields.priority')} name="tm-priority-edit" onChange={(priority) => { onChange({ priority }); }} options={TM_PRIORITIES.map((value) => ({ label: priorityLabel(value), value }))} value={values.priority} />}</Field>
        {select('kpi', TM_OPTIONS.guestKpis)}
      </FormGrid></Card>{meta}
    </>;
  }

  return <>
    <Card><FormGrid>
      {select('location', AA_LOCATIONS, t('form.placeholders.location'), true, (location) => { onChange({ location, zone: '' }); })}
      {select('zone', aaZonesFor(values.location), t('form.placeholders.zone'), true)}
    </FormGrid></Card>
    <Card><h3 className="m-0 text-sm font-semibold text-fg-3">{t('form.sections.mappingRow')}</h3><FormGrid>
      {select('area', MASTER_ADD_OPTIONS.areas, t('form.placeholders.area'), true)}
      {select('subArea', MASTER_ADD_OPTIONS.subAreas, t('form.placeholders.subAreaSelect'))}
      {select('touchPoint', MASTER_ADD_OPTIONS.touchPoints)}
      {select('dept', MASTER_ADD_OPTIONS.departments, t('form.select'), true)}
      {select('matrix', MASTER_ADD_OPTIONS.matrixPartners)}
      {select('severity', MASTER_ADD_OPTIONS.severities)}
      {select('priority', MASTER_ADD_OPTIONS.priorities)}
      {select('kpi', MASTER_ADD_OPTIONS.guestKpis)}
    </FormGrid></Card>{meta}
  </>;
}
