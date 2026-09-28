import { Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EnquiryAttachments } from './EnquiryAttachments';
import { captionedFiles } from '../domain/captionedFiles';
import {
  createBlankEnquiry,
  ENQUIRY_DEPARTMENTS,
  ENQUIRY_PRIORITIES,
} from '../data/enquiries.mock';
import type { EnquiryDraft, EnquiryPriority } from '../types/enquiries.types';
import { Chip } from '@/shared/ui/chip/Chip';

const inputClass =
  'w-full rounded-menu border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent';

const priorityTone: Record<EnquiryPriority, string> = {
  High: 'var(--bad)',
  Low: 'var(--ok)',
  Medium: 'var(--brand-yellow)',
};

function SectionHeading({
  subtitle,
  title,
}: Readonly<{ subtitle: string; title: string }>) {
  return (
    <div className="mb-3.5">
      <h2 className="m-0 text-lg font-semibold tracking-[-0.01em]">{title}</h2>
      <p className="mt-0.5 mb-0 text-base text-fg-3">{subtitle}</p>
    </div>
  );
}

function FieldLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">
      {children}
    </span>
  );
}

/** @prototype ihub/index.html:L7034-L7105 `EnquiryView`. */
export function EnquiryAdd() {
  const { t } = useTranslation('enquiries');
  const [form, setForm] = useState<EnquiryDraft>(createBlankEnquiry);
  const [message, setMessage] = useState('');

  const patch = (next: Partial<EnquiryDraft>) => {
    setForm((current) => ({ ...current, ...next }));
  };
  const captionsValid = captionedFiles(form.files);
  const canSubmit =
    Boolean(form.subject.trim()) && Boolean(form.priority) && captionsValid;

  const selectOptions = (includePicked = true) =>
    ENQUIRY_DEPARTMENTS.filter(
      (department) => includePicked || !form.matrix.includes(department),
    ).map((department) => (
      <option key={department} value={department}>
        {department}
      </option>
    ));

  return (
    <div className="flex max-w-[940px] flex-col gap-4">
      <SectionHeading subtitle={t('add.subtitle')} title={t('add.title')} />

      <section className="flex flex-col gap-[18px] rounded-xl border border-line bg-surface p-[22px]">
        <FieldLabel>{t('fields.subject')}</FieldLabel>
        <input
          aria-label={t('fields.subject')}
          className={inputClass}
          onChange={(event) => {
            patch({ subject: event.currentTarget.value });
          }}
          placeholder={t('placeholders.subject')}
          value={form.subject}
        />

        <hr className="hairline" />
        <FieldLabel>{t('sections.ownership')}</FieldLabel>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <label className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel>{t('fields.owner')}</FieldLabel>
            <select
              className={`${inputClass} cursor-pointer ${form.owner ? 'text-fg' : 'text-fg-3'}`}
              onChange={(event) => {
                patch({ owner: event.currentTarget.value });
              }}
              value={form.owner}
            >
              <option value="">{t('placeholders.select')}</option>
              {selectOptions()}
            </select>
          </label>

          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel>{t('fields.priority')}</FieldLabel>
            <div
              aria-label={t('fields.priority')}
              className="flex flex-wrap gap-2"
              role="group"
            >
              {ENQUIRY_PRIORITIES.map((priority) => {
                const selected = form.priority === priority;
                return (
                  <button
                    aria-pressed={selected}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm-plus font-medium data-[selected=true]:font-bold"
                    data-selected={selected}
                    key={priority}
                    onClick={() => {
                      patch({ priority });
                    }}
                    style={{
                      background: selected
                        ? `color-mix(in oklab, ${priorityTone[priority]} 14%, transparent)`
                        : 'var(--canvas)',
                      borderColor: selected
                        ? priorityTone[priority]
                        : 'var(--line-strong)',
                      color: selected ? priorityTone[priority] : 'var(--fg-2)',
                    }}
                    type="button"
                  >
                    <span
                      aria-hidden
                      className="size-2.25 rounded-full"
                      style={{ background: priorityTone[priority] }}
                    />
                    {t(
                      `priority.${priority.toLowerCase() as Lowercase<EnquiryPriority>}`,
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <label className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel>{t('fields.matrix')}</FieldLabel>
          <select
            aria-label={t('fields.matrix')}
            className={`${inputClass} cursor-pointer text-fg-3`}
            onChange={(event) => {
              const value = event.currentTarget.value;
              if (value && !form.matrix.includes(value))
                patch({ matrix: [...form.matrix, value] });
            }}
            value=""
          >
            <option value="">{t('placeholders.select')}</option>
            {selectOptions(false)}
          </select>
        </label>
        {form.matrix.length ? (
          <div className="flex flex-wrap gap-1.5">
            {form.matrix.map((department) => (
              <Chip className="gap-1.5" key={department} tone="accent">
                {department}
                <button
                  className="leading-none"
                  onClick={() => {
                    patch({
                      matrix: form.matrix.filter((item) => item !== department),
                    });
                  }}
                  type="button"
                >
                  {'×'}
                </button>
              </Chip>
            ))}
          </div>
        ) : null}

        <hr className="hairline" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5 rounded-xl border border-line bg-canvas p-4">
          {[
            [t('metadata.requestedBy'), 'M. Faris — Duty Manager'],
            [t('metadata.requestedDate'), '28 Jul 2026 · 09:14'],
            [t('metadata.reference'), 'ENQ-135 (auto)'],
          ].map(([label, value]) => (
            <div className="flex flex-col gap-0.75" key={label}>
              <FieldLabel>{label}</FieldLabel>
              <span className="text-sm-plus font-semibold text-fg">
                {value}
              </span>
            </div>
          ))}
        </div>

        <hr className="hairline" />
        <label className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel>{t('fields.description')}</FieldLabel>
          <textarea
            className={`${inputClass} resize-y leading-[1.55]`}
            onChange={(event) => {
              patch({ description: event.currentTarget.value });
            }}
            placeholder={t('placeholders.description')}
            rows={4}
            value={form.description}
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel>{t('fields.logNote')}</FieldLabel>
          <textarea
            className={`${inputClass} resize-y leading-[1.55]`}
            onChange={(event) => {
              patch({ logNote: event.currentTarget.value });
            }}
            placeholder={t('placeholders.logNote')}
            rows={2}
            value={form.logNote}
          />
        </label>
      </section>

      <EnquiryAttachments
        files={form.files}
        onAdd={(files) => {
          patch({ files: [...form.files, ...files] });
        }}
        onCaptionChange={(index, caption) => {
          patch({
            files: form.files.map((file, itemIndex) =>
              itemIndex === index ? { ...file, caption } : file,
            ),
          });
        }}
        onRemove={(index) => {
          patch({
            files: form.files.filter((_, itemIndex) => itemIndex !== index),
          });
        }}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-[18px]">
        {message ? (
          <Chip tone="ok">{message}</Chip>
        ) : (
          <span className="text-sm text-fg-3">
            {!captionsValid
              ? t('messages.captionRequired')
              : !form.subject.trim() || !form.priority
                ? t('messages.fieldsRequired')
                : t('messages.priorityNotice')}
          </span>
        )}
        <div className="ms-auto flex flex-wrap gap-2">
          <button
            className="rounded-lg px-3 py-2 text-sm-plus font-semibold text-fg-2 hover:bg-inset"
            onClick={() => {
              setForm(createBlankEnquiry());
              setMessage('');
            }}
            type="button"
          >
            {t('actions.clear')}
          </button>
          {/* PROTOTYPE-NOOP(D2): visible acknowledgement only; no draft is persisted. */}
          <button
            className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm-plus font-semibold text-fg-2 hover:bg-inset"
            onClick={() => {
              setMessage(t('messages.draftSaved'));
              window.setTimeout(() => {
                setMessage('');
              }, 2400);
            }}
            type="button"
          >
            {t('actions.saveDraft')}
          </button>
          {/* PROTOTYPE-NOOP(D2): submission only shows the fixed success message. */}
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm-plus font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return;
              setMessage(t('messages.submitted'));
              window.setTimeout(() => {
                setMessage('');
              }, 2800);
            }}
            type="button"
          >
            <Check aria-hidden size={14} />
            {t('actions.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
