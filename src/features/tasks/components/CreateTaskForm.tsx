import {
  Check,
  Download,
  FolderOpen,
  Grid3X3,
  MapPin,
  Plus,
  X,
} from 'lucide-react';
import {
  type ChangeEvent,
  type DragEvent,
  type PropsWithChildren,
  type ReactNode,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { useTasksStore } from '../store/tasks.store';
import type {
  Task,
  TaskKind,
  TaskRisk,
} from '../types/task.types';
import { DateField } from '@/shared/form/controls/DateField';
import { Select, type SelectOption } from '@/shared/form/controls/Select';
import { Field } from '@/shared/form/field/Field';
import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

const locations = [
  '360 Mall',
  'The Gate Mall',
  'Al Kout Mall',
  'Assima Mall',
  'All locations',
] as const;
const zones = [
  'Fun Tiki',
  'The Bowl Room',
  'Wonder Zone',
  'Jump',
  'The Court',
  'Planet Laser',
  'Pixel Run',
  'Sky Zone',
  'Make*',
  'Retail',
] as const;
const areas = [
  'Reception / Entrance',
  'Arena / Play Area',
  'Arcade',
  'Redemption / Prize Counter',
  'Party Rooms',
  'Café / F&B',
  'Restrooms',
  'Back-of-house',
] as const;
const subAreas = [
  'Counter / Till',
  'Kitchen',
  'Play Structure',
  'Ticketing',
  'Lockers',
  'Seating Area',
  'Storage',
  'Control Room',
  'Entrance Gate',
  'Queue Line',
] as const;
const projectCategories = [
  'Capital Project',
  'Renovation & Fit-out',
  'Event & Activation',
  'Maintenance Program',
  'Operational Improvement',
  'IT & Systems',
] as const;
const assetCategories = [
  'Rides & Attractions',
  'HVAC & Mechanical',
  'Electrical Systems',
  'F&B Equipment',
  'IT & AV Equipment',
  'Furniture & Fixtures',
  'Vehicles & Golf Carts',
  'Safety Equipment',
] as const;
const classCategories = [
  'Ops-related',
  'Guest-related',
  'Compliance-related',
  'Commercial-related',
] as const;
const classTypes = ['Reactive', 'Proactive', 'Scheduled', 'Preventive'] as const;
const risks = ['Critical', 'High', 'Medium', 'Low', 'None'] as const;
const touchpoints = [
  'Arrival & parking',
  'Ticketing & entry',
  'Wayfinding',
  'Activity / play',
  'F&B service',
  'Redemption counter',
  'Restrooms',
  'Party rooms',
  'Exit & feedback',
] as const;
const guestKpis = [
  'CSAT',
  'NPS',
  'Customer Effort Score',
  'Google rating',
  'Mystery visit score',
  'Complaint rate',
] as const;
const team = [
  'Tom Baker',
  'Sarah Johnson',
  'Mike Chen',
  'Emily Davis',
  'Ahmed Ali',
] as const;
const requesterTypes = [
  'Manager',
  'Supervisor',
  'Staff',
  'Contractor',
  'Guest Relations',
] as const;
const enquiryOptions = [
  'ENQ-118 — Party booking availability, Al Kout',
  'ENQ-121 — Group rate request, 360 Mall',
  'ENQ-126 — Lost item follow-up, The Avenues',
  'ENQ-130 — Corporate event enquiry, SAMA Mall',
] as const;
const observationOptions = [
  'OBS-2026-072 — Wet floor near Jump entry',
  'OBS-2026-071 — Harness inspection log completed',
  'OBS-2026-069 — Queue barrier tape frayed',
  'OBS-2026-066 — Near miss on soft play stairs',
] as const;
const incidentOptions = [
  'INC-2034 — Access-control door fault, The Avenues',
  'INC-2037 — Payment gateway latency, all venues',
  'INC-2039 — HVAC failure, SAMA Cinema',
  'INC-2041 — POS network outage, 360 Mall',
] as const;

type Priority = 'critical' | 'high' | 'low' | 'medium';
export type TaskFormPresentation = 'modal' | 'page';
/** Values a caller may seed into the canonical create form (M9.2 incident conversion). */
export type TaskFormPrefill = Readonly<{
  area?: string;
  carriedAttachments?: readonly string[];
  details?: string;
  location?: string;
  priority?: Priority;
  scope?: TaskKind;
  severity?: Priority;
  subArea?: string;
  subject?: string;
  zone?: string;
}>;
type LocationRow = Readonly<{
  area: string;
  location: string;
  subArea: string;
  zone: string;
}>;
type Attachment = Readonly<{
  date: string;
  file: File;
  id: string;
  name: string;
  size: number;
}>;

const inputClass =
  'w-full rounded-menu border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent';

function toOptions(values: readonly string[]): readonly SelectOption[] {
  return values.map((value) => ({ label: value, value }));
}

/** Keeps a prefilled value selectable when the canonical option list does not contain it. */
function withValue(values: readonly string[], value: string): readonly string[] {
  return value && !values.includes(value) ? [value, ...values] : values;
}

function Card({ children }: PropsWithChildren) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-[22px]">
      {children}
    </section>
  );
}

function CardTitle({ children }: PropsWithChildren) {
  return <h2 className="m-0 text-md font-semibold tracking-[-0.01em]">{children}</h2>;
}

function Grid({ children }: PropsWithChildren) {
  return <div className="grid grid-cols-1 gap-x-5 gap-y-4 tablet:grid-cols-2">{children}</div>;
}

function Segments<T extends string>({
  ariaLabel,
  onChange,
  options,
  value,
}: Readonly<{
  ariaLabel: string;
  onChange: (value: T) => void;
  options: readonly Readonly<{ label: string; value: T }>[];
  value: T;
}>) {
  return (
    <div
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-0.5 rounded-[10px] border border-line bg-inset p-0.5"
      role="group"
    >
      {options.map((option) => (
        <button
          aria-pressed={value === option.value}
          className="rounded-lg px-2.5 py-1.5 text-base font-medium text-fg-2 aria-pressed:bg-surface aria-pressed:font-semibold aria-pressed:text-accent aria-pressed:shadow-segment"
          key={option.value}
          onClick={() => { onChange(option.value); }}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ReadOnlyField({ ariaLabel, value }: Readonly<{ ariaLabel: string; value: string }>) {
  return (
    <input
      aria-label={ariaLabel}
      className="h-[42px] w-full cursor-default rounded-menu border border-interactive-light bg-interactive-soft px-4 text-base text-interactive outline-none"
      readOnly
      value={value}
    />
  );
}

function localDate(date: Date) {
  return `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function requestedAt(date: Date) {
  const hour = date.getHours();
  const twelveHour = hour % 12 || 12;
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear())} ${String(twelveHour).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function fileSize(size: number) {
  if (size < 1024) return `${String(size)} B`;
  if (size < 1_048_576) return `${String(Math.round(size / 1024))} KB`;
  return `${(size / 1_048_576).toFixed(1)} MB`;
}

function riskValue(priority: Priority): TaskRisk {
  return `${priority[0]?.toUpperCase() ?? ''}${priority.slice(1)}` as TaskRisk;
}

export function CreateTaskForm({
  initialValues,
  presentation = 'page',
}: Readonly<{ initialValues?: TaskFormPrefill; presentation?: TaskFormPresentation }>) {
  const { t } = useTranslation('taskCreate');
  const isModal = presentation === 'modal';
  const prependTask = useTasksStore((state) => state.prependTask);
  const inputRef = useRef<HTMLInputElement>(null);
  const [requestedOn] = useState(() => new Date());
  const [subject, setSubject] = useState(initialValues?.subject ?? '');
  const [projectName, setProjectName] = useState('');
  const [projectCategory, setProjectCategory] = useState('');
  const [details, setDetails] = useState(initialValues?.details ?? '');
  const [scope, setScope] = useState<TaskKind>(initialValues?.scope ?? 'internal');
  const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? 'medium');
  const [severity, setSeverity] = useState<Priority>(initialValues?.severity ?? 'medium');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attachments, setAttachments] = useState<readonly Attachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [location, setLocation] = useState(initialValues?.location ?? '');
  const [zone, setZone] = useState(initialValues?.zone ?? '');
  const [area, setArea] = useState(initialValues?.area ?? '');
  const [subArea, setSubArea] = useState(initialValues?.subArea ?? '');
  const [locationRows, setLocationRows] = useState<readonly LocationRow[]>([]);
  const [assetCategory, setAssetCategory] = useState('');
  const [assetName, setAssetName] = useState('');
  const [assetCode, setAssetCode] = useState('');
  const [category, setCategory] = useState('Ops-related');
  const [taskType, setTaskType] = useState('Reactive');
  const [risk, setRisk] = useState('');
  const [impactedArea, setImpactedArea] = useState('');
  const [touchpoint, setTouchpoint] = useState('');
  const [guestKpi, setGuestKpi] = useState('');
  const [processOwner, setProcessOwner] = useState('Tom Baker');
  const [matrixPartners, setMatrixPartners] = useState<readonly string[]>([]);
  const [requesterType, setRequesterType] = useState('Manager');
  const [enquiry, setEnquiry] = useState('');
  const [observation, setObservation] = useState('');
  const [incident, setIncident] = useState('');
  const [qrOpen, setQrOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const carriedAttachments = initialValues?.carriedAttachments ?? [];

  const addFiles = (files: FileList | readonly File[]) => {
    const date = localDate(new Date());
    setAttachments((current) => [
      ...current,
      ...Array.from(files).map((file, index) => ({
        date,
        file,
        id: `${file.name}-${String(file.lastModified)}-${String(index)}-${String(Date.now())}`,
        name: file.name,
        size: file.size,
      })),
    ]);
  };

  const reset = () => {
    setSubject('');
    setProjectName('');
    setProjectCategory('');
    setDetails('');
    setScope('internal');
    setPriority('medium');
    setSeverity('medium');
    setStartDate('');
    setEndDate('');
    setAttachments([]);
    setLocation('');
    setZone('');
    setArea('');
    setSubArea('');
    setLocationRows([]);
    setAssetCategory('');
    setAssetName('');
    setAssetCode('');
    setCategory('Ops-related');
    setTaskType('Reactive');
    setRisk('');
    setImpactedArea('');
    setTouchpoint('');
    setGuestKpi('');
    setProcessOwner('Tom Baker');
    setMatrixPartners([]);
    setRequesterType('Manager');
    setEnquiry('');
    setObservation('');
    setIncident('');
  };

  const createTask = () => {
    const firstLocation = locationRows[0];
    const task: Task = {
      days: 0,
      department: 'Operations',
      dependencies: 0,
      due: '',
      flow: 'multi',
      id: `TASK-${Date.now().toString().slice(-6)}`,
      kind: scope,
      location: firstLocation?.location ?? location,
      risk: riskValue(priority),
      severity: riskValue(severity),
      sla: '',
      stage: 'Open',
      subject: subject || 'Untitled task',
      zone: firstLocation?.zone ?? zone,
    };
    prependTask(task);
    setCreated(true);
    window.setTimeout(() => { setCreated(false); }, 2600);
  };

  const select = (
    label: string,
    value: string,
    onChange: (next: string) => void,
    values: readonly string[],
    placeholder: string,
  ): ReactNode => (
    <Select
      ariaLabel={label}
      onChange={onChange}
      options={toOptions(values)}
      placeholder={placeholder}
      value={value}
    />
  );

  const priorityOptions = [
    { label: t('options.low'), value: 'low' },
    { label: t('options.medium'), value: 'medium' },
    { label: t('options.high'), value: 'high' },
    { label: t('options.critical'), value: 'critical' },
  ] as const;

  return (
    <div className={isModal ? 'flex flex-col gap-4' : 'flex flex-col gap-4 pb-10'} data-testid={isModal ? 'task-form-body' : 'create-task-page'}>
      {isModal ? null : (
        <div className="order-2 flex flex-wrap items-center justify-end gap-2.5 tablet:order-1">
          {created ? <span className="rounded-full bg-ok/15 px-3 py-1.5 text-sm font-semibold text-ok" role="status">{t('result')}</span> : null}
          <button className="rounded-lg px-4 py-2.5 text-base font-semibold text-fg-2 hover:bg-inset" onClick={reset} type="button">{t('actions.cancel')}</button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-base font-semibold text-accent-ink" onClick={createTask} type="button"><Check aria-hidden size={15} />{t('actions.create')}</button>
        </div>
      )}

      <div className={`order-1 grid ${isModal ? 'grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]' : 'grid-cols-[repeat(auto-fit,minmax(320px,1fr))]'} items-start gap-4 tablet:order-2`} data-testid="create-task-grid">
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>{t('details.title')}</CardTitle>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-sm font-semibold text-fg-2" onClick={() => { setQrOpen(true); }} type="button"><Grid3X3 aria-hidden size={14} />{t('actions.scan')}</button>
            </div>
            <Field label={t('details.subject')}><input aria-label={t('details.subject')} className={inputClass} onChange={(event) => { setSubject(event.target.value); }} placeholder={t('details.subjectPlaceholder')} value={subject} /></Field>
            <Grid>
              <Field label={t('details.projectName')}><input aria-label={t('details.projectName')} className={inputClass} onChange={(event) => { setProjectName(event.target.value); }} placeholder={t('details.projectNamePlaceholder')} value={projectName} /></Field>
              <Field label={t('details.projectCategory')}>{select(t('details.projectCategory'), projectCategory, setProjectCategory, projectCategories, t('options.selectCategory'))}</Field>
            </Grid>
            <Field label={t('details.description')}><textarea aria-label={t('details.description')} className={`${inputClass} min-h-24 resize-y leading-relaxed`} onChange={(event) => { setDetails(event.target.value); }} placeholder={t('details.descriptionPlaceholder')} value={details} /></Field>
            <Field label={t('details.scope')}><Segments ariaLabel={t('details.scope')} onChange={setScope} options={[{ label: t('options.internal'), value: 'internal' }, { label: t('options.external'), value: 'external' }]} value={scope} /></Field>
            <Grid>
              <Field label={t('details.priority')}><Segments ariaLabel={t('details.priority')} onChange={setPriority} options={priorityOptions} value={priority} /></Field>
              <Field label={t('details.severity')}><Segments ariaLabel={t('details.severity')} onChange={setSeverity} options={priorityOptions} value={severity} /></Field>
            </Grid>
            <Grid>
              <Field label={t('details.startDate')}><DateField ariaLabel={t('details.startDate')} onChange={setStartDate} value={startDate} /></Field>
              <Field label={t('details.endDate')}><DateField ariaLabel={t('details.endDate')} onChange={setEndDate} value={endDate} /></Field>
            </Grid>
          </Card>

          <Card>
            <CardTitle>{t('attachments.title')}</CardTitle>
            <div
              className={`cursor-pointer rounded-xl border border-dashed p-5 text-center ${dragOver ? 'border-accent bg-accent-dim' : 'border-line-strong bg-canvas'}`}
              data-testid="attachment-drop-zone"
              onClick={() => { inputRef.current?.click(); }}
              onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); inputRef.current?.click(); } }}
              onDragLeave={() => { setDragOver(false); }}
              onDragOver={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragOver(true); }}
              onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragOver(false); addFiles(event.dataTransfer.files); }}
              role="button"
              tabIndex={0}
            >
              <input
                accept=".jpg,.jpeg,.png,.pdf"
                aria-label={t('attachments.upload')}
                className="hidden"
                multiple
                onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) addFiles(event.target.files); event.target.value = ''; }}
                ref={inputRef}
                type="file"
              />
              <FolderOpen aria-hidden className="mx-auto text-accent" size={22} />
              <p className="mt-2 mb-0 text-base font-semibold">{t('attachments.upload')}</p>
              <p className="mt-1 mb-0 text-sm text-fg-3">{t('attachments.uploadTypes')}</p>
            </div>
            {carriedAttachments.length ? (
              <div className="flex flex-col gap-2" data-testid="carried-attachment-list">
                <h3 className="m-0 text-xs font-semibold tracking-wider text-fg-3 uppercase">{t('attachments.carried')}</h3>
                {carriedAttachments.map((name) => (
                  <div className="flex items-center gap-2.5 rounded-menu border border-line bg-canvas px-3 py-2.5" key={name}>
                    <FolderOpen aria-hidden className="shrink-0 text-accent" size={16} />
                    <p className="m-0 min-w-0 flex-1 truncate text-base font-semibold">{name}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {attachments.length ? (
              <div className="flex flex-col gap-2" data-testid="attachment-list">
                {attachments.map((attachment) => (
                  <div className="flex items-center gap-2.5 rounded-menu border border-line bg-canvas px-3 py-2.5" key={attachment.id}>
                    <FolderOpen aria-hidden className="shrink-0 text-accent" size={16} />
                    <div className="min-w-0 flex-1"><p className="m-0 truncate text-base font-semibold">{attachment.name}</p><p className="m-0 text-sm text-fg-3">{`${fileSize(attachment.size)} · ${t('attachments.currentUser')} · ${attachment.date}`}</p></div>
                    <button aria-label={`${t('actions.download')} ${attachment.name}`} className="p-1 text-fg-3" onClick={() => { const url = URL.createObjectURL(attachment.file); const link = document.createElement('a'); link.href = url; link.download = attachment.name; document.body.append(link); link.click(); link.remove(); window.setTimeout(() => { URL.revokeObjectURL(url); }, 4000); }} type="button"><Download aria-hidden size={15} /></button>
                    <button aria-label={`${t('actions.remove')} ${attachment.name}`} className="p-1 text-fg-4" onClick={() => { setAttachments((current) => current.filter((item) => item.id !== attachment.id)); }} type="button"><X aria-hidden size={15} /></button>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>{t('location.title')}</CardTitle><span className="rounded-full border border-line px-2.5 py-1 text-sm text-fg-2">{`${String(locationRows.length)} ${t('location.added')}`}</span></div>
            <p className="m-0 text-base leading-relaxed text-fg-2">{t('location.description')}</p>
            <Grid>
              <Field label={t('location.location')}>{select(t('location.location'), location, setLocation, withValue(locations, initialValues?.location ?? ''), t('options.selectLocation'))}</Field>
              <Field label={t('location.zone')}>{select(t('location.zone'), zone, setZone, withValue(zones, initialValues?.zone ?? ''), t('options.selectZone'))}</Field>
              <Field label={t('location.area')}>{select(t('location.area'), area, setArea, withValue(areas, initialValues?.area ?? ''), t('options.anyArea'))}</Field>
              <Field label={t('location.subArea')}>{select(t('location.subArea'), subArea, setSubArea, withValue(subAreas, initialValues?.subArea ?? ''), t('options.anySubArea'))}</Field>
            </Grid>
            <div className="flex justify-end"><button className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink" onClick={() => { if (location || zone) { setLocationRows((rows) => [...rows, { area, location, subArea, zone }]); setLocation(''); setZone(''); setArea(''); setSubArea(''); } }} type="button"><Plus aria-hidden size={15} />{t('actions.add')}</button></div>
            {locationRows.length ? <div className="flex flex-col gap-2">{locationRows.map((row, index) => <div className="flex items-center gap-2.5 rounded-menu border border-line bg-canvas px-3 py-2.5" data-testid="location-row" key={`${row.location}-${row.zone}-${String(index)}`}><MapPin aria-hidden className="text-accent" size={15} /><span className="min-w-0 flex-1 text-base"><strong>{row.location || '—'}</strong>{[row.zone, row.area, row.subArea].filter(Boolean).length ? <span className="text-fg-3">{` · ${[row.zone, row.area, row.subArea].filter(Boolean).join(' · ')}`}</span> : null}</span><button aria-label={`${t('actions.remove')} ${row.location || row.zone}`} className="p-1 text-fg-4" onClick={() => { setLocationRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index)); }} type="button"><X aria-hidden size={15} /></button></div>)}</div> : <p className="m-0 text-center text-base text-fg-4">{t('location.empty')}</p>}
          </Card>

          <Card>
            <CardTitle>{t('asset.title')}</CardTitle>
            <Grid>
              <Field label={t('asset.category')}>{select(t('asset.category'), assetCategory, setAssetCategory, assetCategories, t('options.selectCategory'))}</Field>
              <Field label={t('asset.name')}><input aria-label={t('asset.name')} className={inputClass} onChange={(event) => { setAssetName(event.target.value); }} placeholder={t('asset.namePlaceholder')} value={assetName} /></Field>
            </Grid>
            <Field label={t('asset.code')}><input aria-label={t('asset.code')} className={inputClass} onChange={(event) => { setAssetCode(event.target.value); }} placeholder={t('asset.codePlaceholder')} value={assetCode} /></Field>
          </Card>

          <Card>
            <CardTitle>{t('classification.title')}</CardTitle>
            <Grid>
              <Field label={t('classification.category')}>{select(t('classification.category'), category, setCategory, classCategories, t('options.select'))}</Field>
              <Field label={t('classification.taskType')}>{select(t('classification.taskType'), taskType, setTaskType, classTypes, t('options.select'))}</Field>
              <Field label={t('classification.risk')}>{select(t('classification.risk'), risk, setRisk, risks, t('options.selectRisk'))}</Field>
              <Field label={t('classification.impactedArea')}><input aria-label={t('classification.impactedArea')} className={inputClass} onChange={(event) => { setImpactedArea(event.target.value); }} placeholder={t('classification.impactedPlaceholder')} value={impactedArea} /></Field>
              <Field label={t('classification.touchpoint')}>{select(t('classification.touchpoint'), touchpoint, setTouchpoint, touchpoints, t('options.select'))}</Field>
              <Field label={t('classification.guestKpi')}>{select(t('classification.guestKpi'), guestKpi, setGuestKpi, guestKpis, t('options.select'))}</Field>
            </Grid>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardTitle>{t('classification.title')}</CardTitle>
            <h3 className="m-0 border-b border-line pb-2 text-xs font-semibold tracking-wider text-fg-3 uppercase">{t('requester.assignment')}</h3>
            <Field label={t('requester.processOwner')}>{select(t('requester.processOwner'), processOwner, setProcessOwner, team, t('options.select'))}</Field>
            <Field label={t('requester.matrixPartner')}>
              {matrixPartners.length ? <div className="mb-2 flex flex-wrap gap-2">{matrixPartners.map((partner) => <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-dim px-2.5 py-1 text-sm font-semibold text-accent" key={partner}>{partner}<button aria-label={`${t('actions.remove')} ${partner}`} onClick={() => { setMatrixPartners((items) => items.filter((item) => item !== partner)); }} type="button"><X aria-hidden size={12} /></button></span>)}</div> : null}
              <Select ariaLabel={t('requester.matrixPartner')} onChange={(value) => { if (value && !matrixPartners.includes(value)) setMatrixPartners((items) => [...items, value]); }} options={toOptions(team.filter((member) => member !== processOwner && !matrixPartners.includes(member)))} placeholder="Add matrix partner…" value="" />
            </Field>
            <h3 className="m-0 border-b border-line pb-2 text-xs font-semibold tracking-wider text-fg-3 uppercase">{t('requester.title')}</h3>
            <Grid>
              <Field label={t('requester.requestedAt')}><ReadOnlyField ariaLabel={t('requester.requestedAt')} value={requestedAt(requestedOn)} /></Field>
              <Field label={t('requester.requestedBy')}><ReadOnlyField ariaLabel={t('requester.requestedBy')} value="Tom Baker" /></Field>
            </Grid>
            <Field label={t('requester.type')}>{select(t('requester.type'), requesterType, setRequesterType, requesterTypes, t('options.select'))}</Field>
            <Field label={t('requester.department')}>
              <div className="flex flex-wrap items-stretch gap-2.5"><div className="min-w-36 flex-1"><ReadOnlyField ariaLabel={t('requester.department')} value="Operations" /></div><div className="flex min-w-44 flex-1 items-center justify-between gap-2 rounded-menu border border-accent/25 bg-accent-dim px-4"><div><p className="m-0 text-xs font-semibold tracking-wide text-accent uppercase">{t('requester.days')}</p><p className="m-0 text-base"><strong>{t('requester.daysValue', { count: 0 })}</strong> <span className="text-sm text-accent">{t('requester.since')}</span></p></div></div></div>
            </Field>
          </Card>

          <Card>
            <CardTitle>{t('references.title')}</CardTitle>
            <Grid>
              <Field label={t('references.enquiry')}>{select(t('references.enquiry'), enquiry, setEnquiry, enquiryOptions, t('references.selectEnquiry'))}</Field>
              <Field label={t('references.observation')}>{select(t('references.observation'), observation, setObservation, observationOptions, t('references.selectObservation'))}</Field>
              <Field label={t('references.incident')}>{select(t('references.incident'), incident, setIncident, incidentOptions, t('references.selectIncident'))}</Field>
              <Field label={t('references.source')}><input aria-label={t('references.source')} className={`${inputClass} cursor-default bg-inset text-fg-2`} readOnly value="Generic" /></Field>
            </Grid>
          </Card>
        </div>
      </div>

      <DialogRoot onOpenChange={setQrOpen} open={qrOpen}>
        <DialogContent className="w-[min(420px,calc(100%-32px))]">
          <DialogHeader><DialogTitle className="text-md font-semibold">{t('qr.title')}</DialogTitle><button aria-label="Close" className="ms-auto p-1 text-fg-3" onClick={() => { setQrOpen(false); }} type="button"><X aria-hidden size={16} /></button></DialogHeader>
          <DialogBody className="items-center text-center">
            <div className="flex w-full items-center gap-3 text-start"><span className="flex size-10 items-center justify-center rounded-xl bg-accent-dim text-accent"><Grid3X3 aria-hidden size={19} /></span><h3 className="m-0 text-lg font-semibold">{t('qr.title')}</h3></div>
            <div className="flex aspect-square w-full max-w-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-canvas text-fg-4"><Grid3X3 aria-hidden size={28} /><span className="text-sm">{t('qr.camera')}</span></div>
            <p className="m-0 text-base text-fg-3">{t('qr.description')}</p>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-base font-semibold text-accent-ink" onClick={() => { setAssetCode(`AST-${String(new Date().getFullYear())}-${String(Math.floor(1000 + Math.random() * 9000))}`); setQrOpen(false); }} type="button"><Grid3X3 aria-hidden size={15} />{t('actions.simulate')}</button>
            <button className="font-semibold text-accent underline" onClick={() => { setQrOpen(false); }} type="button">{t('actions.enterManually')}</button>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
