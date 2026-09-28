import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ObservationAttachments } from './ObservationAttachments';
import {
  createBlankObservation,
  OBSERVATION_AREAS,
  OBSERVATION_DEPARTMENTS,
  OBSERVATION_LINK_OPTIONS,
  OBSERVATION_LOCATIONS,
  OBSERVATION_PRIORITIES,
  OBSERVATION_SEVERITIES,
  OBSERVATION_SUB_AREAS,
  OBSERVATION_TOUCH_POINTS,
  OBSERVATION_ZONES,
} from '../data/observations.mock';
import type {
  ObservationDraft,
  ObservationLinkKind,
  ObservationPriority,
  ObservationSeverity,
} from '../types/observations.types';
import { captionedFiles } from '@/features/enquiries';
import { Chip } from '@/shared/ui/chip/Chip';

const inputClass =
  'w-full rounded-menu border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent';

const severityTone: Record<ObservationSeverity, string> = {
  High: '#D0342C',
  Low: '#1F9D55',
  Medium: '#D9A100',
};

function FieldLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">
      {children}
    </span>
  );
}

type SelectFieldProps = Readonly<{
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  value: string;
}>;

function SelectField({
  label,
  onChange,
  options,
  placeholder,
  value,
}: SelectFieldProps) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <select
        aria-label={label}
        className={`${inputClass} cursor-pointer ${value ? 'text-fg' : 'text-fg-3'}`}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
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

type LinkConfig = Readonly<{
  kind: ObservationLinkKind;
  labelKey:
    | 'fields.enquiryReference'
    | 'fields.incidentReference'
    | 'fields.taskReference';
  linkedKey: 'linkedEnquiries' | 'linkedIncidents' | 'linkedTasks';
  selectionKey: 'enquirySelection' | 'incidentSelection' | 'taskSelection';
}>;

const linkConfigs: readonly LinkConfig[] = [
  {
    kind: 'enquiry',
    labelKey: 'fields.enquiryReference',
    linkedKey: 'linkedEnquiries',
    selectionKey: 'enquirySelection',
  },
  {
    kind: 'task',
    labelKey: 'fields.taskReference',
    linkedKey: 'linkedTasks',
    selectionKey: 'taskSelection',
  },
  {
    kind: 'incident',
    labelKey: 'fields.incidentReference',
    linkedKey: 'linkedIncidents',
    selectionKey: 'incidentSelection',
  },
];

const textAreas = [
  {
    key: 'finding',
    labelKey: 'fields.finding',
    placeholderKey: 'placeholders.finding',
    rows: 4,
  },
  {
    key: 'recommendations',
    labelKey: 'fields.recommendations',
    placeholderKey: 'placeholders.recommendations',
    rows: 3,
  },
  {
    key: 'logNote',
    labelKey: 'fields.logNote',
    placeholderKey: 'placeholders.logNote',
    rows: 2,
  },
] as const;

/** @prototype ihub/index.html:L6889-L7030 `ObservationsView` Add branch. */
export function ObservationAdd() {
  const { t } = useTranslation('observations');
  const [form, setForm] = useState<ObservationDraft>(createBlankObservation);
  const [message, setMessage] = useState('');

  const patch = (next: Partial<ObservationDraft>) => {
    setForm((current) => ({ ...current, ...next }));
  };
  const captionsValid = captionedFiles(form.files);
  // PROTOTYPE-NOOP(D2): subject and every non-attachment field are deliberately
  // excluded from gating. Empty files are valid through Array.every semantics.
  const canSubmit = captionsValid;

  const translatedChoice = (
    group: 'priority' | 'severity',
    value: ObservationPriority | ObservationSeverity,
  ) => t(`${group}.${value.toLowerCase() as Lowercase<typeof value>}`);

  return (
    <div
      className="flex max-w-[940px] flex-col gap-4"
      data-testid="observation-add"
    >
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
        <span className="eyebrow">{t('sections.where')}</span>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <SelectField
            label={t('fields.location')}
            onChange={(location) => {
              patch({ location });
            }}
            options={OBSERVATION_LOCATIONS}
            placeholder={t('placeholders.select')}
            value={form.location}
          />
          <SelectField
            label={t('fields.zone')}
            onChange={(zone) => {
              patch({ zone });
            }}
            options={OBSERVATION_ZONES}
            placeholder={t('placeholders.select')}
            value={form.zone}
          />
          <SelectField
            label={t('fields.department')}
            onChange={(department) => {
              patch({ department });
            }}
            options={OBSERVATION_DEPARTMENTS}
            placeholder={t('placeholders.select')}
            value={form.department}
          />
          <SelectField
            label={t('fields.area')}
            onChange={(area) => {
              patch({ area });
            }}
            options={OBSERVATION_AREAS}
            placeholder={t('placeholders.select')}
            value={form.area}
          />
          <SelectField
            label={t('fields.subArea')}
            onChange={(subArea) => {
              patch({ subArea });
            }}
            options={OBSERVATION_SUB_AREAS}
            placeholder={t('placeholders.select')}
            value={form.subArea}
          />
          <SelectField
            label={t('fields.touchPoint')}
            onChange={(touchPoint) => {
              patch({ touchPoint });
            }}
            options={OBSERVATION_TOUCH_POINTS}
            placeholder={t('placeholders.select')}
            value={form.touchPoint}
          />
        </div>

        <hr className="hairline" />
        <span className="eyebrow">{t('sections.ownership')}</span>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <SelectField
            label={t('fields.owner')}
            onChange={(owner) => {
              patch({ owner });
            }}
            options={OBSERVATION_DEPARTMENTS}
            placeholder={t('placeholders.select')}
            value={form.owner}
          />
          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel>{t('fields.severity')}</FieldLabel>
            <div
              aria-label={t('fields.severity')}
              className="flex flex-wrap gap-2"
              role="group"
            >
              {OBSERVATION_SEVERITIES.map((severity) => {
                const selected = form.severity === severity;
                return (
                  <button
                    aria-pressed={selected}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm-plus font-medium data-[selected=true]:font-bold"
                    data-selected={selected}
                    key={severity}
                    onClick={() => {
                      patch({ severity });
                    }}
                    style={{
                      background: selected
                        ? `color-mix(in oklab, ${severityTone[severity]} 14%, transparent)`
                        : 'var(--canvas)',
                      borderColor: selected
                        ? severityTone[severity]
                        : 'var(--line-strong)',
                      color: selected ? severityTone[severity] : 'var(--fg-2)',
                    }}
                    type="button"
                  >
                    <span
                      aria-hidden
                      className="size-2.25 rounded-full"
                      style={{ background: severityTone[severity] }}
                    />
                    {translatedChoice('severity', severity)}
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
            {OBSERVATION_DEPARTMENTS.filter(
              (item) => !form.matrix.includes(item),
            ).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        {form.matrix.length ? (
          <div className="flex flex-wrap gap-1.5">
            {form.matrix.map((department) => (
              <Chip className="gap-1.5" key={department} tone="accent">
                {department}
                <button
                  aria-label={t('actions.removeValue', { value: department })}
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

        <div className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel>{t('fields.priority')}</FieldLabel>
          <div
            aria-label={t('fields.priority')}
            className="inline-flex self-start rounded-[10px] border border-line bg-raised p-0.5"
            role="group"
          >
            {OBSERVATION_PRIORITIES.map((priority) => (
              <button
                aria-pressed={form.priority === priority}
                className="rounded-md aria-pressed:shadow-sm px-3.5 py-1.5 text-sm-plus font-medium text-fg-3 aria-pressed:bg-surface aria-pressed:font-semibold aria-pressed:text-fg"
                key={priority}
                onClick={() => {
                  patch({ priority });
                }}
                type="button"
              >
                {translatedChoice('priority', priority)}
              </button>
            ))}
          </div>
        </div>

        <hr className="hairline" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5 rounded-xl border border-line bg-canvas p-4">
          {[
            [t('metadata.requestedBy'), 'M. Faris — Duty Manager'],
            [t('metadata.requestedDate'), '28 Jul 2026 · 09:14'],
            [t('metadata.reference'), 'OBS-2026-073 (auto)'],
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
        <span className="eyebrow">{t('sections.linkedRecords')}</span>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
          {linkConfigs.map((config) => {
            const selection = form[config.selectionKey];
            const linked = form[config.linkedKey];
            return (
              <div className="flex min-w-0 flex-col gap-1.5" key={config.kind}>
                <FieldLabel>{t(config.labelKey)}</FieldLabel>
                <div className="flex items-center gap-2">
                  <select
                    aria-label={t(config.labelKey)}
                    className={`${inputClass} cursor-pointer`}
                    onChange={(event) => {
                      patch({
                        [config.selectionKey]: event.currentTarget.value,
                      });
                    }}
                    value={selection}
                  >
                    <option value="">
                      {t('placeholders.searchReference')}
                    </option>
                    {OBSERVATION_LINK_OPTIONS[config.kind]
                      .filter((item) => !linked.includes(item))
                      .map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                  </select>
                  <button
                    className="rounded-lg border border-line-strong bg-surface px-2.5 py-1.5 text-sm font-semibold text-fg-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selection}
                    onClick={() => {
                      if (!selection) return;
                      patch({
                        [config.linkedKey]: [...linked, selection],
                        [config.selectionKey]: '',
                      });
                    }}
                    type="button"
                  >
                    {t('actions.link')}
                  </button>
                </div>
                {linked.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {linked.map((item) => (
                      <Chip className="gap-1.5" key={item} tone="accent">
                        {item}
                        <button
                          aria-label={t('actions.removeValue', { value: item })}
                          className="leading-none"
                          onClick={() => {
                            patch({
                              [config.linkedKey]: linked.filter(
                                (value) => value !== item,
                              ),
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
              </div>
            );
          })}
        </div>

        <hr className="hairline" />
        {textAreas.map(({ key, labelKey, placeholderKey, rows }) => (
          <label className="flex min-w-0 flex-col gap-1.5" key={key}>
            <FieldLabel>{t(labelKey)}</FieldLabel>
            <textarea
              className={`${inputClass} resize-y leading-[1.55]`}
              onChange={(event) => {
                patch({ [key]: event.currentTarget.value });
              }}
              placeholder={t(placeholderKey)}
              rows={rows}
              value={form[key]}
            />
          </label>
        ))}
      </section>

      <ObservationAttachments
        files={form.files}
        onAdd={() => {
          patch({
            files: [
              ...form.files,
              {
                caption: '',
                name: `photo-${String(form.files.length + 1)}.jpg`,
              },
            ],
          });
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
            {captionsValid
              ? t('messages.severityNotice')
              : t('messages.captionRequired')}
          </span>
        )}
        <div className="ms-auto flex flex-wrap gap-2">
          <button
            className="rounded-lg px-3 py-2 text-sm-plus font-semibold text-fg-2 hover:bg-inset"
            onClick={() => {
              setForm(createBlankObservation());
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
          {/* PROTOTYPE-NOOP(D2): captions are the sole gate and submission is message-only. */}
          <button
            className="rounded-lg bg-accent px-3 py-2 text-sm-plus font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return;
              setMessage(t('messages.submitted'));
              window.setTimeout(() => {
                setMessage('');
              }, 2600);
            }}
            type="button"
          >
            {t('actions.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
