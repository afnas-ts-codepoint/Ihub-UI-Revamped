import { Folder, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { PoAttachmentFile } from '../types/purchasing.types';

type AttachmentListProps = Readonly<{
  files: readonly PoAttachmentFile[];
  onAdd: (files: readonly PoAttachmentFile[]) => void;
  onCaptionChange: (index: number, caption: string) => void;
  onRemove: (index: number) => void;
}>;

const captionInputClass =
  'min-w-[180px] flex-[1_1_180px] rounded-lg bg-surface px-3 py-2.5 text-base text-fg outline-none';

/**
 * The smallest reusable unit covering the prototype's captioned-attachment
 * list: file rows (non-editable name + caption input + remove), the
 * always-on red caption-missing border, and a click-only file picker. Kept
 * feature-local to Purchasing and intentionally does not bake in any
 * M6.5-only concerns (currency, collapsible sections, supplier letters).
 *
 * Click-to-pick only — the prototype's "Click to upload or drag and drop"
 * copy is dead text; there is no `onDrop`/`onDragOver`/`onDragEnter`
 * anywhere in `poAttachModal`, so none is implemented here either.
 * @prototype index.html:L10384-L10393 (attachment rows + file-picker label)
 */
export function AttachmentList({ files, onAdd, onCaptionChange, onRemove }: AttachmentListProps) {
  const { t } = useTranslation('purchasing');

  return (
    <div className="flex flex-col gap-2.5">
      {files.length ? (
        <div className="flex flex-col gap-2.5">
          {files.map((file, index) => (
            <div
              className={`flex flex-wrap items-center gap-2.5 rounded-lg border p-3 ${file.caption.trim() ? 'border-line' : 'border-bad'}`}
              key={`${file.name}-${String(index)}`}
            >
              <Folder aria-hidden="true" className="shrink-0 text-accent" size={16} />
              <span className="min-w-[120px] flex-1 truncate text-sm-plus font-semibold">
                {file.name || t('attachments.untitledFile')}
              </span>
              <input
                className={captionInputClass}
                onChange={(event) => { onCaptionChange(index, event.currentTarget.value); }}
                placeholder={t('attachments.captionPlaceholder')}
                value={file.caption}
              />
              <button className="shrink-0 p-0.5 text-fg-4" onClick={() => { onRemove(index); }} type="button">
                <X aria-hidden="true" size={15} />
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
            const picked = Array.from(event.currentTarget.files ?? []).map((file) => ({ caption: '', name: file.name }));
            if (picked.length) onAdd(picked);
            event.currentTarget.value = '';
          }}
          type="file"
        />
        <Folder aria-hidden="true" className="mx-auto text-accent" size={20} />
        <div className="mt-2 text-sm-plus font-semibold">{t('attachments.uploadHint')}</div>
        <div className="mt-1 text-xs text-fg-3">{t('attachments.captionHint')}</div>
      </label>
    </div>
  );
}
