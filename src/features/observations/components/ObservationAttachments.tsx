import { useTranslation } from 'react-i18next';

import type { ObservationAttachment } from '../types/observations.types';

type Props = Readonly<{
  files: readonly ObservationAttachment[];
  onAdd: () => void;
  onCaptionChange: (index: number, caption: string) => void;
  onRemove: (index: number) => void;
}>;

const inputClass =
  'w-full rounded-menu border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent';

/** @prototype ihub/index.html:L7006-L7024 Observations attachment card. */
export function ObservationAttachments({
  files,
  onAdd,
  onCaptionChange,
  onRemove,
}: Props) {
  const { t } = useTranslation('observations');

  return (
    <section className="flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-[22px]">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="eyebrow">{t('attachments.title')}</span>
        <span className="text-sm text-fg-3">{t('attachments.intro')}</span>
        <button
          className="ms-auto rounded-lg border border-line-strong bg-surface px-2.5 py-1.5 text-sm font-semibold text-fg-2 hover:bg-inset"
          onClick={onAdd}
          type="button"
        >
          {t('attachments.add')}
        </button>
      </div>

      {files.length ? (
        <div className="flex flex-col gap-2.5">
          {files.map((file, index) => (
            <div
              className={`flex flex-wrap items-center gap-2.5 rounded-lg border bg-canvas p-3 ${file.caption.trim() ? 'border-line' : 'border-bad'}`}
              key={`${file.name}-${String(index)}`}
            >
              <span className="min-w-[120px] text-sm-plus font-semibold">
                {file.name}
              </span>
              <input
                aria-label={`${t('attachments.caption')} — ${file.name}`}
                className={`${inputClass} min-w-[200px] flex-1`}
                onChange={(event) => {
                  onCaptionChange(index, event.currentTarget.value);
                }}
                placeholder={t('attachments.caption')}
                value={file.caption}
              />
              <button
                className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-fg-2 hover:bg-inset"
                onClick={() => {
                  onRemove(index);
                }}
                type="button"
              >
                {t('attachments.remove')}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line-strong p-6 text-center text-sm-plus text-fg-3">
          {t('attachments.empty')}
        </div>
      )}
    </section>
  );
}
