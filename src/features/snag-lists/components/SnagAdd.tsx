import { ChevronDown, Check, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { captionedFiles } from '@/features/enquiries';
import { Chip } from '@/shared/ui/chip/Chip';
import { SnagAttachments } from './SnagAttachments';
import {
  createBlankSnag,
  SNAG_AREAS,
  SNAG_DEPARTMENTS,
  SNAG_ENQUIRIES,
  SNAG_INCIDENTS,
  SNAG_KPIS,
  SNAG_LOCATIONS,
  SNAG_OBSERVATIONS,
  SNAG_PRIORITIES,
  SNAG_SEVERITIES,
  SNAG_SUB_AREAS,
  SNAG_TOUCH_POINTS,
  SNAG_ZONES,
} from '../data/snag-lists.mock';
import type { SnagDraft } from '../types/snag-lists.types';

const inputClass =
  'w-full rounded-menu border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent';
function Label({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">
      {children}
    </span>
  );
}
function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: Readonly<{
  label: string;
  value: string;
  options: readonly string[];
  placeholder: string;
  onChange: (value: string) => void;
}>) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <Label>{label}</Label>
      <select
        aria-label={label}
        className={`${inputClass} cursor-pointer ${value ? 'text-fg' : 'text-fg-3'}`}
        onChange={(event) => onChange(event.currentTarget.value)}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SnagAdd() {
  const { t } = useTranslation('snagLists');
  const [form, setForm] = useState<SnagDraft>(createBlankSnag);
  const [message, setMessage] = useState('');
  const [convert, setConvert] = useState<'' | 'task' | 'enquiry' | 'incident'>('');
  const [convertOpen, setConvertOpen] = useState(false);
  const patch = (next: Partial<SnagDraft>) =>
    setForm((current) => ({ ...current, ...next }));
  const canSubmit = captionedFiles(form.files);
  const select = (
    label: string,
    key: keyof SnagDraft,
    options: readonly string[],
  ) => (
    <SelectField
      label={label}
      value={String(form[key])}
      options={options}
      placeholder={t('placeholders.select')}
      onChange={(value) => patch({ [key]: value })}
    />
  );
  const addMatrix = (value: string) => {
    if (value && !form.matrix.includes(value))
      patch({ matrix: [...form.matrix, value] });
  };
  const convertLabel = convert ? t(`convert.${convert}`) : t('actions.convert');
  const submitMessage = convert
    ? `${t('messages.submitted')} ${t('messages.converted')} ${convert.toLowerCase()} · ${convert === 'task' ? 'TSK-2026-' : `${convert.toUpperCase()}-`}300`
    : t('messages.submitted');

  return (
    <div className="flex max-w-[940px] flex-col gap-4" data-testid="snag-add">
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-[22px]">
        <span className="eyebrow">{t('sections.where')}</span>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
          {select(t('fields.location'), 'location', SNAG_LOCATIONS)}
          {select(t('fields.zone'), 'zone', SNAG_ZONES)}
          {select(t('fields.area'), 'area', SNAG_AREAS)}
          {select(t('fields.subArea'), 'subArea', SNAG_SUB_AREAS)}
          {select(t('fields.touchpoint'), 'touch', SNAG_TOUCH_POINTS)}
          {select(t('fields.kpi'), 'kpi', SNAG_KPIS)}
        </div>
        <hr className="hairline" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5 rounded-xl border border-line bg-canvas p-4">
          <div>
            <Label>{t('metadata.requestedBy')}</Label>
            <p className="m-0 text-sm-plus font-semibold text-fg">
              M. Faris — Duty Manager
            </p>
          </div>
          <div>
            <Label>{t('metadata.department')}</Label>
            <p className="m-0 text-sm-plus font-semibold text-fg">Operations</p>
          </div>
          <div>
            <Label>{t('metadata.requestedDate')}</Label>
            <p className="num m-0 text-sm-plus font-semibold text-fg">
              28 Jul 2026 · 09:14
            </p>
          </div>
          <div>
            <Label>{t('metadata.reference')}</Label>
            <p className="num m-0 text-sm-plus font-semibold text-fg">
              SNG-2026-042 (auto)
            </p>
          </div>
        </div>
        <hr className="hairline" />
        <span className="eyebrow">{t('sections.ownership')}</span>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
          {select(t('fields.owner'), 'owner', SNAG_DEPARTMENTS)}
          {select(t('fields.priority'), 'priority', SNAG_PRIORITIES)}
          {select(t('fields.severity'), 'severity', SNAG_SEVERITIES)}
        </div>
        <label className="flex min-w-0 flex-col gap-1.5">
          <Label>{t('fields.matrix')}</Label>
          <select
            aria-label={t('fields.matrix')}
            className={`${inputClass} cursor-pointer text-fg-3`}
            onChange={(event) => addMatrix(event.currentTarget.value)}
            value=""
          >
            <option value="">{t('placeholders.select')}</option>
            {SNAG_DEPARTMENTS.filter((item) => !form.matrix.includes(item)).map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
          </select>
        </label>
        {form.matrix.length ? (
          <div className="flex flex-wrap gap-1.5">
            {form.matrix.map((item) => (
              <Chip className="gap-1.5" key={item} tone="accent">
                {item}
                <button
                  aria-label={t('actions.removeValue', { value: item })}
                  className="leading-none"
                  onClick={() =>
                    patch({
                      matrix: form.matrix.filter((value) => value !== item),
                    })
                  }
                  type="button"
                >
                  ×
                </button>
              </Chip>
            ))}
          </div>
        ) : null}
        <hr className="hairline" />
        <label className="flex min-w-0 flex-col gap-1.5">
          <Label>{t('fields.details')}</Label>
          <textarea
            aria-label={t('fields.details')}
            className={`${inputClass} resize-y leading-[1.55]`}
            onChange={(event) => patch({ details: event.currentTarget.value })}
            placeholder={t('placeholders.details')}
            rows={4}
            value={form.details}
          />
        </label>
        <span className="eyebrow">{t('sections.linkedRecords')}</span>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3.5">
          {select(t('fields.enquiry'), 'enqRef', SNAG_ENQUIRIES)}
          {select(t('fields.observation'), 'obsRef', SNAG_OBSERVATIONS)}
          {select(t('fields.incident'), 'incRef', SNAG_INCIDENTS)}
        </div>
        <label className="flex min-w-0 flex-col gap-1.5">
          <Label>{t('fields.logNote')}</Label>
          <textarea
            aria-label={t('fields.logNote')}
            className={`${inputClass} resize-y leading-[1.55]`}
            onChange={(event) => patch({ logNote: event.currentTarget.value })}
            placeholder={t('placeholders.logNote')}
            rows={2}
            value={form.logNote}
          />
        </label>
      </section>
      <SnagAttachments
        files={form.files}
        onAdd={(files) => patch({ files: [...form.files, ...files] })}
        onCaptionChange={(index, caption) =>
          patch({
            files: form.files.map((file, itemIndex) =>
              itemIndex === index ? { ...file, caption } : file,
            ),
          })
        }
        onRemove={(index) =>
          patch({
            files: form.files.filter((_, itemIndex) => itemIndex !== index),
          })
        }
      />
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-[18px]">
        {message ? (
          <Chip tone="ok">{message}</Chip>
        ) : (
          <span className="text-sm text-fg-3">
            {canSubmit
              ? t('messages.severityNotice')
              : t('messages.captionRequired')}
          </span>
        )}
        <div className="ms-auto flex flex-wrap gap-2">
          <button
            className="rounded-lg px-3 py-2 text-sm-plus font-semibold text-fg-2 hover:bg-inset"
            onClick={() => {
              setForm(createBlankSnag());
              setConvert('');
              setConvertOpen(false);
              setMessage('');
            }}
            type="button"
          >
            {t('actions.clear')}
          </button>
          <button
            className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm-plus font-semibold text-fg-2 hover:bg-inset"
            onClick={() => {
              setMessage(t('messages.draftSaved'));
              window.setTimeout(() => setMessage(''), 2400);
            }}
            type="button"
          >
            {t('actions.saveDraft')}
          </button>
          <div className="relative">
            <button
              aria-expanded={convertOpen}
              className={`rounded-lg px-3 py-2 text-sm-plus font-semibold ${convert ? 'border border-line-strong bg-surface text-fg' : 'text-fg-2 hover:bg-inset'}`}
              onClick={() => setConvertOpen((value) => !value)}
              type="button"
            >
              <RefreshCw aria-hidden size={14} /> {convertLabel}{' '}
              <ChevronDown aria-hidden size={13} />
            </button>
            {convertOpen ? (
              <div className="shadow-xl absolute inset-inline-end-0 bottom-full z-10 mb-1 flex min-w-[190px] flex-col rounded-xl border border-line bg-surface p-1">
                {(['task', 'enquiry', 'incident'] as const).map((kind) => (
                  <button
                    className="rounded-lg px-2.5 py-2 text-start text-sm-plus hover:bg-inset"
                    key={kind}
                    onClick={() => {
                      setConvert(kind);
                      setConvertOpen(false);
                    }}
                    type="button"
                  >
                    {t(`convert.${kind}`)}{' '}
                    <span className="num float-end text-xs text-fg-3">
                      {kind === 'task' ? 'TSK-2026-' : `${kind.toUpperCase()}-`}
                      300
                    </span>
                  </button>
                ))}
                {convert ? (
                  <button
                    className="border-t border-line px-2.5 py-2 text-start text-sm text-fg-3"
                    onClick={() => {
                      setConvert('');
                      setConvertOpen(false);
                    }}
                    type="button"
                  >
                    {t('actions.dontConvert')}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm-plus font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return;
              setMessage(submitMessage);
              window.setTimeout(() => setMessage(''), 3000);
            }}
            type="button"
          >
            <Check aria-hidden size={14} />{' '}
            {convert ? t('actions.submitConvert') : t('actions.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
