import { Check, Folder } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EMPTY_INCIDENT_REPORT, INCIDENT_OPTIONS } from '../data/incidents.mock';
import type { IncidentAttachment, IncidentReportValues } from '../types/incidents.types';
import { DateField } from '@/shared/form/controls/DateField';
import { Select } from '@/shared/form/controls/Select';
import { TextArea } from '@/shared/form/controls/TextArea';
import { TextInput } from '@/shared/form/controls/TextInput';
import { Field } from '@/shared/form/field/Field';
import { Chip } from '@/shared/ui/chip/Chip';

const option = (value: string) => ({ label: value, value });
type ReportFieldKey = Exclude<keyof IncidentReportValues, 'attachments'>;
type ReportAreaKey = 'description' | 'guestAction' | 'houseAction' | 'notes';

const reporterFields = [
  ['requestedBy', 'M. Faris'],
  ['designation', 'Duty Manager — Operations'],
  ['reportingDate', '27 Jul 2026'],
  ['reportingTime', '14:32'],
] as const;

export function IncidentReportForm() {
  const { t } = useTranslation('incidents');
  const [form, setForm] = useState<IncidentReportValues>(EMPTY_INCIDENT_REPORT);
  const [message, setMessage] = useState('');
  const update = (patch: Partial<IncidentReportValues>) => { setForm((value) => ({ ...value, ...patch })); };
  const select = (key: ReportFieldKey, values: readonly string[]) => (
    <Select ariaLabel={t(`fields.${key}`)} onChange={(value) => { update({ [key]: value }); }} options={values.map(option)} placeholder={t('actions.select')} value={form[key]} />
  );
  const text = (key: ReportFieldKey, placeholder = '') => (
    <TextInput aria-label={t(`fields.${key}`)} onChange={(event) => { update({ [key]: event.currentTarget.value }); }} placeholder={placeholder} value={form[key]} />
  );
  const area = (key: ReportAreaKey, rows = 2) => (
    <TextArea aria-label={t(`fields.${key}`)} onChange={(event) => { update({ [key]: event.currentTarget.value }); }} placeholder={t(`placeholders.${key}`)} rows={rows} value={form[key]} />
  );
  const segmented = (key: 'facility' | 'injuries') => (
    <div className="inline-flex w-fit gap-0.5 rounded-[10px] border border-line bg-raised p-0.5">
      {(['no', 'yes'] as const).map((value) => (
        <button className={`rounded-md px-3 py-1.5 text-sm ${form[key] === value ? 'bg-surface font-semibold text-accent shadow-sm' : 'text-fg-2'}`} key={value} onClick={() => { update({ [key]: value }); }} type="button">{t(`actions.${value}`)}</button>
      ))}
    </div>
  );
  const editAttachment = (index: number, patch: Partial<IncidentAttachment>) => { update({ attachments: form.attachments.map((file, fileIndex) => fileIndex === index ? { ...file, ...patch } : file) }); };

  return (
    <div className="flex max-w-[900px] flex-col gap-4">
      <header><h2 className="display m-0 text-4xl font-medium">{t('report.title')}</h2><p className="mt-1 text-base text-fg-3">{t('report.subtitle')}</p></header>
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-[22px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <Field label={t('fields.location')}>{select('location', INCIDENT_OPTIONS.locations)}</Field>
          <Field label={t('fields.zone')}>{select('zone', INCIDENT_OPTIONS.zones)}</Field>
          <Field label={t('fields.department')}>{select('department', INCIDENT_OPTIONS.departments)}</Field>
          <Field label={t('fields.area')}>{select('area', INCIDENT_OPTIONS.areas)}</Field>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <Field label={t('fields.mainCategory')}>{select('mainCategory', INCIDENT_OPTIONS.mainCategories)}</Field>
          <Field label={t('fields.subCategory')}>{select('subCategory', INCIDENT_OPTIONS.subCategories)}</Field>
          <Field label={t('fields.scenario')}>{select('scenario', INCIDENT_OPTIONS.scenarios)}</Field>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <Field label={t('fields.riskType')}>{select('riskType', INCIDENT_OPTIONS.risks)}</Field>
          <Field label={t('fields.impactType')}>{select('impactType', INCIDENT_OPTIONS.impacts)}</Field>
        </div>
        <Field label={t('fields.mailTo')}>
          <div className="flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-menu border border-line-strong bg-raised px-3 py-2">
            {['dutymanager@tamdeen.com', 'safety@tamdeen.com', 'ops.director@tamdeen.com'].map((email) => <Chip key={email}>{email}</Chip>)}
          </div>
          <span className="text-xs-plus text-fg-3">{t('report.distribution')}</span>
        </Field>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <Field label={t('fields.date')}><DateField onChange={(date) => { update({ date }); }} value={form.date} /></Field>
          <Field label={t('fields.time')}><TextInput aria-label={t('fields.time')} onChange={(event) => { update({ time: event.currentTarget.value }); }} type="time" value={form.time} /></Field>
          <Field label={t('fields.specificArea')}>{text('specificArea', t('placeholders.specificArea'))}</Field>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <Field label={t('fields.injuries')}>{segmented('injuries')}</Field>
          <Field label={t('fields.facility')}>{segmented('facility')}</Field>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <Field label={t('fields.employees')}>{text('employees', t('placeholders.employees'))}</Field>
          <Field label={t('fields.employeePosition')}>{text('employeePosition', t('placeholders.employeePosition'))}</Field>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <Field label={t('fields.witnessEmail')}>{text('witnessEmail', 'witness@example.com')}</Field>
          <Field label={t('fields.guestName')}>{text('guestName', t('placeholders.guestName'))}</Field>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <Field label={t('fields.guestContact')}>{text('guestContact', '+965 0000 0000')}</Field>
          <Field label={t('fields.guestEmail')}>{text('guestEmail', 'guest@example.com')}</Field>
        </div>
        <Field label={t('fields.guestAction')}>{area('guestAction')}</Field>
        <Field label={t('fields.houseAction')}>{area('houseAction')}</Field>
        <Field label={t('fields.notes')}>{area('notes')}</Field>
        <section className="rounded-xl border border-line bg-canvas p-4">
          <span className="eyebrow">{t('report.reporter')}</span>
          <div className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
            {reporterFields.map(([key, value]) => <div key={key}><div className="eyebrow text-2xs-plus">{t(`report.${key}`)}</div><strong className="mt-1 block text-sm-plus">{value}</strong></div>)}
          </div>
        </section>
        <Field label={t('fields.description')}>{area('description', 4)}</Field>
        <section className="flex flex-col gap-2.5">
          <span className="eyebrow">{t('attachments.title')}</span>
          {form.attachments.map((file, index) => (
            <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-line bg-raised p-3" key={`${file.name}-${String(index)}`}>
              <Folder aria-hidden className="text-accent" size={16} /><strong className="min-w-[120px] flex-1">{file.name}</strong>
              <TextInput aria-label={`${t('attachments.caption')} — ${file.name}`} className={`min-w-[180px] flex-1 ${file.caption.trim() ? '' : 'border-bad'}`} onChange={(event) => { editAttachment(index, { caption: event.currentTarget.value }); }} placeholder={t('attachments.caption')} value={file.caption} />
              <button className="text-sm font-semibold text-fg-3" onClick={() => { update({ attachments: form.attachments.filter((_, fileIndex) => fileIndex !== index) }); }} type="button">{t('actions.remove')}</button>
            </div>
          ))}
          <label className="cursor-pointer rounded-xl border border-dashed border-line-strong bg-raised p-[18px] text-center">
            <input className="hidden" multiple onChange={(event) => { const files = Array.from(event.currentTarget.files ?? []).map((file) => ({ caption: '', name: file.name })); update({ attachments: [...form.attachments, ...files] }); event.currentTarget.value = ''; }} type="file" />
            <Folder aria-hidden className="mx-auto text-accent" size={20} /><div className="mt-2 font-semibold">{t('attachments.upload')}</div><div className="mt-1 text-sm text-fg-3">{t('attachments.hint')}</div>
          </label>
        </section>
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          {message ? <Chip tone="ok">{message}</Chip> : <span className="text-sm text-fg-3">{t('report.notice')}</span>}
          <div className="ms-auto flex flex-wrap gap-2">
            <button className="rounded-lg px-3 py-2 text-sm font-semibold text-fg-2" onClick={() => { setForm(EMPTY_INCIDENT_REPORT); setMessage(''); }} type="button">{t('actions.clear')}</button>
            <button className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-semibold" onClick={() => { setMessage(t('messages.draftSaved')); }} type="button">{t('actions.saveDraft')}</button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink" onClick={() => { setMessage(t('messages.submitted')); }} type="button"><Check aria-hidden size={14} />{t('actions.submit')}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
