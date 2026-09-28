import { Folder } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { EnquiryAttachment } from '../types/enquiries.types';

type Props = Readonly<{
  files: readonly EnquiryAttachment[];
  onAdd: (files: readonly EnquiryAttachment[]) => void;
  onCaptionChange: (index: number, caption: string) => void;
  onRemove: (index: number) => void;
}>;

const inputClass =
  'w-full rounded-menu border border-line-strong bg-surface px-3 py-2.5 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent';

/** @prototype ihub/index.html:L7084-L7099 Enquiry attachment card. */
export function EnquiryAttachments({
  files,
  onAdd,
  onCaptionChange,
  onRemove,
}: Props) {
  const { t } = useTranslation('enquiries');

  return (
    <section className="flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-[22px]">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="eyebrow">{t('attachments.title')}</span>
        <span className="text-sm text-fg-3">{t('attachments.intro')}</span>
      </div>

      {files.length ? (
        <div className="flex flex-col gap-2.5">
          {files.map((file, index) => (
            <div
              className={`flex flex-wrap items-center gap-2.5 rounded-lg border bg-canvas p-3 ${file.caption.trim() ? 'border-line' : 'border-bad'}`}
              key={`${file.name}-${String(index)}`}
            >
              <Folder aria-hidden className="shrink-0 text-accent" size={15} />
              <span className="min-w-[120px] overflow-hidden text-sm-plus font-semibold text-ellipsis whitespace-nowrap">
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
      ) : null}

      <label className="block cursor-pointer rounded-xl border border-dashed border-line-strong bg-raised p-[18px] text-center">
        <input
          className="hidden"
          multiple
          onChange={(event) => {
            const picked = Array.from(event.currentTarget.files ?? []).map(
              (file) => ({
                caption: '',
                name: file.name,
              }),
            );
            if (picked.length) onAdd(picked);
            event.currentTarget.value = '';
          }}
          type="file"
        />
        <Folder aria-hidden className="mx-auto text-accent" size={20} />
        <div className="mt-2 text-base font-semibold">
          {t('attachments.upload')}
        </div>
        <div className="mt-1 text-sm text-fg-3">{t('attachments.hint')}</div>
      </label>
    </section>
  );
}
