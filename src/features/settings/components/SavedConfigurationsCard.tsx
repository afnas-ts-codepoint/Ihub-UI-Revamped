import { useTranslation } from 'react-i18next';

import type { DashboardBuilderState } from '../hooks/useDashboardBuilder';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

type SavedConfigurationsCardProps = Readonly<{ builder: DashboardBuilderState }>;

/**
 * Saved-configuration library: Recent/Popular sort, and per-entry
 * Load/Preview/Duplicate/Delete/Star actions.
 * @prototype index.html:L7398-L7418
 */
export function SavedConfigurationsCard({ builder }: SavedConfigurationsCardProps) {
  const { t } = useTranslation('settings');

  return (
    <div className="rounded-dialog border border-line bg-surface p-5">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h3 className="m-0 text-base font-semibold">
          {builder.isUser ? t('library.titlePersonal') : t('library.titleAdmin')}
        </h3>
        <div className="inline-flex gap-0.5 rounded-lg bg-inset p-0.5">
          {(['recent', 'popular'] as const).map((sortId) => (
            <button
              className={`rounded-compact px-3 py-1.5 text-sm font-medium ${
                builder.librarySort === sortId ? 'bg-surface font-semibold text-accent shadow-segment' : 'text-fg-2'
              }`}
              key={sortId}
              onClick={() => { builder.setLibrarySort(sortId); }}
              type="button"
            >
              {t(`library.${sortId}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-1 flex max-h-130 flex-col gap-3 overflow-y-auto px-1">
        {builder.library.length ? (
          builder.library.map((entry) => (
            <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-canvas p-3.5" key={entry.id}>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-sm-plus font-semibold">
                    {entry.name}
                    <button
                      className={entry.fav ? 'flex text-warn' : 'flex text-fg-4'}
                      onClick={() => { builder.toggleLibraryEntryStar(entry.id); }}
                      title={entry.fav ? t('library.unstar') : t('library.star')}
                      type="button"
                    >
                      <Icon name="star" size={14} />
                    </button>
                  </div>
                  <div className="mt-0.5 text-xs text-fg-3">
                    {t('library.appliedTo')}
                    {': '}
                    {entry.applied}
                  </div>
                </div>
                <Chip tone={entry.status === 'Active' ? 'ok' : 'warn'}>
                  {entry.status === 'Active' ? t('library.active') : t('library.draft')}
                </Chip>
              </div>
              <div className="flex items-center gap-2 text-2xs text-fg-3">
                <span className="flex-1">
                  {t('library.by')} {entry.by}
                </span>
                <span className="font-mono">{entry.date}</span>
                <span className="ms-2 font-mono">
                  {entry.uses} {t('library.uses')}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <button
                  className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink"
                  onClick={() => { builder.loadLibraryEntry(entry); }}
                  type="button"
                >
                  {t('library.load')}
                </button>
                <button
                  aria-label={t('library.preview')}
                  className="rounded-lg px-2 py-1.5 text-fg-2 hover:bg-inset"
                  onClick={() => { builder.previewLibraryEntry(entry); }}
                  title={t('library.preview')}
                  type="button"
                >
                  <Icon name="eye" size={16} />
                </button>
                <button
                  aria-label={t('library.duplicate')}
                  className="rounded-lg px-2 py-1.5 text-fg-2 hover:bg-inset"
                  onClick={() => { builder.duplicateLibraryEntry(entry.id); }}
                  title={t('library.duplicate')}
                  type="button"
                >
                  <Icon name="layers" size={16} />
                </button>
                <button
                  aria-label={t('library.delete')}
                  className="rounded-lg px-2 py-1.5 text-bad hover:bg-inset"
                  onClick={() => { builder.deleteLibraryEntry(entry.id); }}
                  title={t('library.delete')}
                  type="button"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-sm-plus text-fg-4">
            {builder.isUser ? t('library.emptyPersonal') : t('library.empty')}
          </div>
        )}
      </div>
    </div>
  );
}
