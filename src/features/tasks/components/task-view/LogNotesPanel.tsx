import { MessageSquare, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TASK_VIEW_LOG_NOTES } from '../../data/taskView.mock';
import { Avatar } from '@/shared/ui/avatar/Avatar';

// Passed to the prototype's T(o, o, locale) helper (index.html:L18004 `seg`,
// used by L18788 `logNotesPanel`) — never translated to Arabic; kept literal.
const TABS = ['All Notes', '@Mentions', 'My Notes'] as const;

/**
 * Log Notes — always rendered, even in read-only mode (unlike every other
 * right-column panel, it is unconditional in the prototype's layout). Search
 * filters the seeded conversation by text; the three tabs only change which
 * one is visually active (`logTab`) and are never applied to the note list —
 * a genuine `PROTOTYPE-NOOP` found while re-reading source for this phase (it
 * was not called out in the M8.4 preflight brief). The compose box is
 * read-only-hidden, matching the prototype's `readOnly ? null : …`.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18770-L18798 `logNotesPanel`.
 */
export function LogNotesPanel() {
  const { t } = useTranslation('taskView');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<(typeof TABS)[number]>('All Notes');
  const notes = TASK_VIEW_LOG_NOTES.filter((note) =>
    note.text.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className="flex flex-col gap-3.5 rounded-xl bg-accent-dim p-5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h3 className="m-0 text-md font-semibold tracking-[-0.01em]">{t('logNotes.title')}</h3>
          <p className="m-0 mt-0.5 text-xs-plus text-fg-3">{t('logNotes.subtitle')}</p>
        </div>
        <div className="relative flex items-center">
          <Search aria-hidden className="pointer-events-none absolute inset-s-2.5 text-fg-4" size={13} />
          <input
            aria-label={t('logNotes.search')}
            className="w-30 rounded-lg border border-line-strong bg-surface py-1.5 ps-7.5 pe-2.5 text-sm outline-none"
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            placeholder={t('logNotes.search')}
            value={search}
          />
        </div>
      </div>

      <div
        aria-label={t('logNotes.tabs')}
        className="inline-flex flex-wrap gap-0.5 self-start rounded-[10px] border border-line bg-inset p-0.5"
        role="group"
      >
        {TABS.map((tabId) => (
          <button
            aria-pressed={tab === tabId}
            className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-fg-2 aria-pressed:bg-surface aria-pressed:font-semibold aria-pressed:text-accent"
            key={tabId}
            onClick={() => {
              setTab(tabId);
            }}
            type="button"
          >
            {tabId}
          </button>
        ))}
      </div>

      <div className="flex max-h-65 flex-col gap-2.5 overflow-y-auto">
        {notes.map((note) => (
          <div
            className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-2.5"
            key={`${note.who}-${note.when}`}
          >
            <div className="flex items-center gap-2">
              <Avatar name={note.who} size={22} />
              <span className="text-sm-plus font-semibold">{note.who}</span>
              <span className="text-xs text-fg-4">{note.when}</span>
            </div>
            <div className="text-sm-plus text-fg-2">{note.text}</div>
          </div>
        ))}
        {notes.length === 0 ? (
          <p className="m-0 text-center text-xs-plus text-fg-4">
            <MessageSquare aria-hidden className="mx-auto mb-1" size={16} />
            {t('logNotes.empty')}
          </p>
        ) : null}
      </div>
    </section>
  );
}
