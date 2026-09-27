import { yupResolver } from '@hookform/resolvers/yup';
import { Download, Plus, Trash2, Upload, X } from 'lucide-react';
import {
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { useForm, useWatch, type FieldPath, type FieldPathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { MasterFormValues } from '../domain/formValues';
import { EMPTY_MASTER_FORM } from '../domain/formValues';
import {
  cleanBulkNames,
  mergeBulkNames,
  namesFromDelimitedText,
  namesFromSpreadsheet,
  type BulkNameKind,
} from '../domain/bulkNames';
import { masterFormMissing } from '../domain/requiredFields';
import type { MasterDefinition } from '../domain/types';
import { retainCompatibleZones, zonesForLocations } from '../domain/zonesForLocation';
import { createMasterRecordSchema } from '../schemas/masterRecord.schema';
import { AA_AREA_NAMES, AA_LOCATIONS, AA_ZONES, MASTER_ADD_OPTIONS, TM_OPTIONS, TM_PRIORITIES, TM_SEVERITIES, aaZonesFor } from '../data/seedRows';
import {
  PROJECT_CATEGORY_ACCEPT,
  PROJECT_CATEGORY_SAMPLE,
  SUB_AREA_ACCEPT,
} from '../constants/bulkImport';
import { downloadText } from '@/shared/file/download';
import { readFile } from '@/shared/file/readFile';
import { SpreadsheetReaderLoadError } from '@/shared/file/xlsx';
import { Checkbox } from '@/shared/form/controls/Checkbox';
import { MultiSelectChips } from '@/shared/form/controls/MultiSelectChips';
import { SegmentedRadio } from '@/shared/form/controls/SegmentedRadio';
import { Select, type SelectOption } from '@/shared/form/controls/Select';
import { SwatchRadio } from '@/shared/form/controls/SwatchRadio';
import { TextInput } from '@/shared/form/controls/TextInput';
import { Field } from '@/shared/form/field/Field';
import { FormActions } from '@/shared/form/layout/FormActions';
import { FormGrid } from '@/shared/form/layout/FormGrid';
import { RepeatableRows } from '@/shared/form/layout/RepeatableRows';
import { Chip } from '@/shared/ui/chip/Chip';
import { DialogBody, DialogContent, DialogDescription, DialogHeader, DialogRoot, DialogTitle } from '@/shared/ui/overlay/Dialog';

const opts = (values: readonly string[]): SelectOption[] => values.map((value) => ({ label: value, value }));
const card = (children: ReactNode) => <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-4.5">{children}</section>;

type FrameProps = Readonly<{
  children: ReactNode;
  message: string;
  missing: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
}>;

function AddFrame({ children, message, missing, onClose, onSubmit, title }: FrameProps) {
  const { t } = useTranslation('masters');
  return <DialogRoot onOpenChange={(open) => { if (!open) onClose(); }} open>
    <DialogContent className="w-[min(100%,max(80vw,560px))] max-w-[calc(100%-48px)]" data-testid="master-add-dialog">
      <DialogHeader><DialogTitle className="text-base font-bold">{t('form.addTitle', { title })}</DialogTitle><DialogDescription className="sr-only">{t('form.addTitle', { title })}</DialogDescription><button aria-label={t('form.close')} className="ms-auto inline-flex size-7.5 items-center justify-center rounded-lg border border-line-strong text-fg-3" onClick={onClose} type="button"><X aria-hidden="true" size={14} /></button></DialogHeader>
      <form onSubmit={(event) => { event.preventDefault(); if (!missing) onSubmit(); }}>
        <DialogBody className="gap-4">{children}</DialogBody>
        <FormActions cancelLabel={t('form.cancel')} disabled={missing} message={message} onCancel={onClose} submitLabel={t('form.save')} />
      </form>
    </DialogContent>
  </DialogRoot>;
}

function useBulkImport(
  kind: BulkNameKind,
  setRows: Dispatch<SetStateAction<string[]>>,
) {
  const { t } = useTranslation('masters');
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState('');

  const importSelectedFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    setNote('');

    try {
      const result = await readFile(file);
      const rawNames = result.kind === 'spreadsheet'
        ? namesFromSpreadsheet(result.rows)
        : namesFromDelimitedText(result.text);
      const names = cleanBulkNames(rawNames, kind);

      if (!names.length) {
        setNote(t(kind === 'projectCategory' ? 'form.bulk.noRecords' : 'form.bulk.noSubAreas'));
        return;
      }

      setRows((current) => {
        const merged = mergeBulkNames(current, names);
        return merged.length ? merged : [''];
      });
      setNote(t(
        kind === 'projectCategory' ? 'form.bulk.recordsAdded' : 'form.bulk.subAreasAdded',
        { count: names.length, fileName: file.name },
      ));
    } catch (error) {
      setNote(t(
        error instanceof SpreadsheetReaderLoadError
          ? 'form.bulk.readerLoadFailed'
          : 'form.bulk.fileReadFailed',
      ));
    }
  };

  return { fileRef, importSelectedFile, note };
}

type BulkButtonsProps = Readonly<{
  fileRef: ReturnType<typeof useBulkImport>['fileRef'];
  kind: BulkNameKind;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}>;

function BulkButtons({ fileRef, kind, onFileChange }: BulkButtonsProps) {
  const { t } = useTranslation('masters');
  const subArea = kind === 'subArea';

  return <div className="ms-auto flex flex-wrap gap-2">
    {!subArea ? <button className="inline-flex items-center gap-1.5 text-xs-plus font-semibold text-[var(--blue-med)] underline" onClick={() => { downloadText(PROJECT_CATEGORY_SAMPLE.content, PROJECT_CATEGORY_SAMPLE.filename, PROJECT_CATEGORY_SAMPLE.mimeType, 1_000); }} type="button"><Download aria-hidden="true" size={13} />{t('form.sampleCsv')}</button> : null}
    <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-fg-2 hover:bg-inset" onClick={() => { fileRef.current?.click(); }} type="button"><Upload aria-hidden="true" size={13} />{t(subArea ? 'form.uploadExcel' : 'form.uploadRecords')}</button>
    <input
      accept={subArea ? SUB_AREA_ACCEPT : PROJECT_CATEGORY_ACCEPT}
      className="hidden"
      onChange={onFileChange}
      ref={fileRef}
      type="file"
    />
  </div>;
}

type BulkNameRowsProps = Readonly<{
  addLabel: string;
  fieldLabel: string;
  note?: ReactNode;
  placeholder: string;
  removeLabel: string;
  rows: readonly string[];
  setRows: Dispatch<SetStateAction<string[]>>;
}>;

function BulkNameRows({ addLabel, fieldLabel, note, placeholder, removeLabel, rows, setRows }: BulkNameRowsProps) {
  return <>
    <FormGrid>
      {rows.map((row, index) => <div className="flex items-center gap-2.5" key={index}>
        <TextInput aria-label={fieldLabel} onChange={(event) => { setRows((current) => current.map((value, rowIndex) => rowIndex === index ? event.target.value : value)); }} placeholder={placeholder} value={row} />
        <button aria-label={removeLabel} className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-bad hover:bg-bad/10" onClick={() => { setRows((current) => current.length > 1 ? current.filter((_, rowIndex) => rowIndex !== index) : ['']); }} title={removeLabel} type="button"><Trash2 aria-hidden="true" size={14} /></button>
      </div>)}
    </FormGrid>
    {note}
    <button className="inline-flex w-fit items-center gap-2 py-0.5 text-sm-plus font-bold text-accent" onClick={() => { setRows((current) => [...current, '']); }} type="button"><Plus aria-hidden="true" size={15} />{addLabel}</button>
  </>;
}

function PcAdd({ onClose, title }: Readonly<{ onClose: () => void; title: string }>) {
  const { t } = useTranslation('masters');
  const [rows, setRows] = useState(['']);
  const bulk = useBulkImport('projectCategory', setRows);
  const filled = rows.filter((row) => row.trim());
  const missing = filled.length === 0;
  return <AddFrame message={missing ? t('form.missing.pc') : t(filled.length === 1 ? 'form.readyOne' : 'form.readyOther', { count: filled.length })} missing={missing} onClose={onClose} onSubmit={onClose} title={title}>
    {card(<><div className="flex flex-wrap items-center gap-3"><span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">{t('form.fields.name')}{' *'}</span><BulkButtons fileRef={bulk.fileRef} kind="projectCategory" onFileChange={(event) => { void bulk.importSelectedFile(event); }} /></div><BulkNameRows addLabel={t('form.addMore')} fieldLabel={t('form.fields.name')} note={bulk.note ? <Chip className="w-fit" data-testid="bulk-import-note" tone="ok">{bulk.note}</Chip> : null} placeholder={t('form.placeholders.name')} removeLabel={t('form.remove')} rows={rows} setRows={setRows} /></>)}
  </AddFrame>;
}

function SubAreaAdd({ onClose, title }: Readonly<{ onClose: () => void; title: string }>) {
  const { t } = useTranslation('masters');
  const [location, setLocation] = useState(''); const [zone, setZone] = useState(''); const [assignmentArea, setArea] = useState(''); const [rows, setRows] = useState(['']);
  const bulk = useBulkImport('subArea', setRows);
  const ready = rows.filter((row) => row.trim()).length;
  const missing = !location || !zone || !assignmentArea || ready === 0;
  return <AddFrame message={missing ? t('form.missing.saAdd') : t('form.subAreasReady', { count: ready })} missing={missing} onClose={onClose} onSubmit={onClose} title={title}>
    {card(<FormGrid columns={3}><Field label={t('form.fields.location')} required><Select ariaLabel={t('form.fields.location')} onChange={(value) => { setLocation(value); setZone(''); }} options={opts(AA_LOCATIONS)} placeholder={t('form.placeholders.location')} value={location} /></Field><Field label={t('form.fields.zone')} required><Select ariaLabel={t('form.fields.zone')} onChange={setZone} options={opts(aaZonesFor(location))} placeholder={t('form.placeholders.zone')} value={zone} /></Field><Field label={t('form.fields.assignmentArea')} required><Select ariaLabel={t('form.fields.assignmentArea')} onChange={setArea} options={opts(AA_AREA_NAMES)} placeholder={t('form.placeholders.assignmentArea')} value={assignmentArea} /></Field></FormGrid>)}
    {card(<><div className="flex flex-wrap items-center gap-3"><span className="text-sm font-semibold text-fg-3">{t('form.sections.subAreas')}</span><BulkButtons fileRef={bulk.fileRef} kind="subArea" onFileChange={(event) => { void bulk.importSelectedFile(event); }} /></div><p className="m-0 text-xs-plus text-fg-3">{t('form.uploadHint')}</p>{bulk.note ? <Chip className="w-fit" data-testid="bulk-import-note" tone="ok">{bulk.note}</Chip> : null}<BulkNameRows addLabel={t('form.addMore')} fieldLabel={t('form.fields.subArea')} placeholder={t('form.placeholders.subArea')} removeLabel={t('form.remove')} rows={rows} setRows={setRows} /></>)}
  </AddFrame>;
}

type AreaRow = { name: string; snag: boolean };
function AssignmentAreaAdd({ onClose, title }: Readonly<{ onClose: () => void; title: string }>) {
  const { t } = useTranslation('masters');
  const [location, setLocation] = useState(''); const [zone, setZone] = useState(''); const [rows, setRows] = useState<AreaRow[]>([{ name: '', snag: false }]);
  const missing = !location || !zone || rows.some((row) => !row.name.trim());
  const setRow = (index: number, patch: Partial<AreaRow>) => { setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row)); };
  return <AddFrame message={missing ? t('form.missing.aaAdd') : ''} missing={missing} onClose={onClose} onSubmit={onClose} title={title}>
    {card(<FormGrid><Field label={t('form.fields.location')} required><Select ariaLabel={t('form.fields.location')} onChange={(value) => { setLocation(value); setZone(''); }} options={opts(AA_LOCATIONS)} placeholder={t('form.placeholders.location')} value={location} /></Field><Field label={t('form.fields.zone')} required><Select ariaLabel={t('form.fields.zone')} onChange={setZone} options={opts(aaZonesFor(location))} placeholder={t('form.placeholders.zone')} value={zone} /></Field></FormGrid>)}
    {card(<><h3 className="m-0 text-sm font-semibold text-fg-3">{t('form.sections.areas')}</h3><RepeatableRows addLabel={t('form.addMore')} onAdd={() => { setRows((current) => [...current, { name: '', snag: false }]); }} onRemove={(index) => { setRows((current) => current.filter((_, rowIndex) => rowIndex !== index)); }} removeLabel={t('form.remove')} renderRow={(row, index, remove) => <div className="flex flex-wrap items-end gap-3" key={index}><Field className="min-w-35 flex-1" label={t('form.fields.name')} required><TextInput aria-label={t('form.fields.name')} onChange={(event) => { setRow(index, { name: event.target.value }); }} placeholder={t('form.placeholders.areaName')} value={row.name} /></Field><Checkbox checked={row.snag} label={t('form.fields.snagType')} onChange={(snag) => { setRow(index, { snag }); }} />{remove}</div>} rows={rows} /></>)}
  </AddFrame>;
}

function TaskMappingAdd({ onClose, title }: Readonly<{ onClose: () => void; title: string }>) {
  const { t } = useTranslation('masters');
  const schema = createMasterRecordSchema('tm');
  const { control, setValue } = useForm<MasterFormValues>({ defaultValues: { ...EMPTY_MASTER_FORM, priority: 'medium' }, resolver: yupResolver(schema) });
  const values: MasterFormValues = { ...EMPTY_MASTER_FORM, ...useWatch({ control }) };
  const missing = masterFormMissing(values, 'tm');
  const set = <K extends FieldPath<MasterFormValues>>(
    key: K,
    value: FieldPathValue<MasterFormValues, K>,
  ) => { setValue(key, value, { shouldValidate: true }); };
  const zoneOptions = values.locations.length ? zonesForLocations(values.locations) : [...AA_ZONES];
  const multi = (key: 'areas' | 'locations' | 'matrixList' | 'subAreas' | 'zones', list: readonly string[], placeholder: string, required = false, change?: (next: readonly string[]) => void, hint?: string) => <Field label={t(`form.fields.${key}`)} required={required}><MultiSelectChips ariaLabel={t(`form.fields.${key}`)} onChange={change ?? ((next) => { set(key, [...next]); })} options={opts(list)} placeholder={placeholder} value={values[key]} />{hint ? <span className="text-xs-plus text-fg-3">{hint}</span> : null}</Field>;
  const select = (key: 'applicableFor' | 'dept' | 'kpi' | 'touchPoint', list: readonly string[], required = false) => <Field label={t(`form.fields.${key}`)} required={required}><Select ariaLabel={t(`form.fields.${key}`)} onChange={(next) => { set(key, next); }} options={opts(list)} placeholder={t('form.select')} value={values[key]} /></Field>;
  return <AddFrame message={missing ? t('form.missing.tm') : ''} missing={missing} onClose={onClose} onSubmit={onClose} title={title}>
    {card(<FormGrid>{multi('locations', AA_LOCATIONS, t('form.select'), true, (next) => { set('locations', [...next]); set('zones', retainCompatibleZones(next, values.zones)); })}{multi('zones', zoneOptions, t('form.select'), true)}{multi('areas', TM_OPTIONS.areas, t('form.placeholders.addArea'), true, undefined, t('form.subAreaNote'))}{multi('subAreas', TM_OPTIONS.subAreas, t('form.placeholders.addSubArea'), true)}{select('touchPoint', TM_OPTIONS.touchPoints)}</FormGrid>)}
    {card(<FormGrid>{select('dept', TM_OPTIONS.departments, true)}{multi('matrixList', TM_OPTIONS.matrixPartners, t('form.placeholders.addPartner'))}{select('applicableFor', TM_OPTIONS.applicableFor)}<Field label={t('form.fields.severity')}><SwatchRadio ariaLabel={t('form.fields.severity')} onChange={(value) => { set('severity', value); }} options={TM_SEVERITIES.map((value) => ({ colorClass: value === 'low' ? 'bg-ok' : value === 'medium' ? 'bg-[var(--brand-yellow)]' : 'bg-bad', label: t(`form.severity.${value}`), value }))} value={values.severity} /></Field><Field label={t('form.fields.priority')}><SegmentedRadio ariaLabel={t('form.fields.priority')} name="tm-priority" onChange={(value) => { set('priority', value); }} options={TM_PRIORITIES.map((value) => ({ label: t(`form.priority.${value}`), value }))} value={values.priority} /></Field>{select('kpi', TM_OPTIONS.guestKpis)}</FormGrid>)}
  </AddFrame>;
}

type MappingRow = { area: string; dept: string; kpi: string; matrix: string; priority: string; severity: string; subArea: string; touchPoint: string };
const blankMapping = (): MappingRow => ({ area: '', dept: '', kpi: '', matrix: '', priority: '', severity: '', subArea: '', touchPoint: '' });
function GenericAdd({ onClose, title }: Readonly<{ onClose: () => void; title: string }>) {
  const { t } = useTranslation('masters'); const [location, setLocation] = useState(''); const [zone, setZone] = useState(''); const [rows, setRows] = useState<MappingRow[]>([blankMapping()]);
  const setRow = (index: number, patch: Partial<MappingRow>) => { setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row)); };
  const missing = !location || !zone || rows.some((row) => !row.area || !row.dept);
  const field = (row: MappingRow, index: number, key: keyof MappingRow, list: readonly string[], required = false) => <Field label={t(`form.fields.${key}`)} required={required}><Select ariaLabel={t(`form.fields.${key}`)} onChange={(value) => { setRow(index, { [key]: value }); }} options={opts(list)} placeholder={key === 'area' ? t('form.placeholders.area') : key === 'subArea' ? t('form.placeholders.subAreaSelect') : t('form.select')} value={row[key]} /></Field>;
  return <AddFrame message={missing ? t('form.missing.generic') : ''} missing={missing} onClose={onClose} onSubmit={onClose} title={title}>
    {card(<FormGrid><Field label={t('form.fields.location')}><Select ariaLabel={t('form.fields.location')} onChange={setLocation} options={opts(MASTER_ADD_OPTIONS.locations)} placeholder={t('form.placeholders.location')} value={location} /></Field><Field label={t('form.fields.zone')}><Select ariaLabel={t('form.fields.zone')} onChange={setZone} options={opts(MASTER_ADD_OPTIONS.zones)} placeholder={t('form.placeholders.zone')} value={zone} /></Field></FormGrid>)}
    <RepeatableRows addLabel={t('form.addAnotherRow')} onAdd={() => { setRows((current) => [...current, blankMapping()]); }} removeLabel={t('form.remove')} renderRow={(row, index) => card(<div key={index}><h3 className="mt-0 text-sm font-semibold text-fg-3">{t('form.mappingRow', { count: index + 1 })}</h3><FormGrid>{field(row, index, 'area', MASTER_ADD_OPTIONS.areas, true)}{field(row, index, 'subArea', MASTER_ADD_OPTIONS.subAreas)}{field(row, index, 'touchPoint', MASTER_ADD_OPTIONS.touchPoints)}{field(row, index, 'dept', MASTER_ADD_OPTIONS.departments, true)}{field(row, index, 'matrix', MASTER_ADD_OPTIONS.matrixPartners)}{field(row, index, 'severity', MASTER_ADD_OPTIONS.severities)}{field(row, index, 'priority', MASTER_ADD_OPTIONS.priorities)}{field(row, index, 'kpi', MASTER_ADD_OPTIONS.guestKpis)}</FormGrid></div>)} rows={rows} />
  </AddFrame>;
}

export function MasterAddDialog({ definition, onClose, title }: Readonly<{ definition: MasterDefinition; onClose: () => void; title: string }>) {
  if (definition.mode === 'pc') return <PcAdd onClose={onClose} title={title} />;
  if (definition.mode === 'sa') return <SubAreaAdd onClose={onClose} title={title} />;
  if (definition.mode === 'tm') return <TaskMappingAdd onClose={onClose} title={title} />;
  if (definition.mode === 'aa') return <AssignmentAreaAdd onClose={onClose} title={title} />;
  return <GenericAdd onClose={onClose} title={title} />;
}
