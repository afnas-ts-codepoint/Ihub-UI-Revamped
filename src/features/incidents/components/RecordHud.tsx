import { ChevronDown, Clock } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { incidentHistorySeed } from '../domain/incidentFilter';
import type { IncidentHistoryEntry, IncidentTone } from '../types/incidents.types';
import { Chip } from '@/shared/ui/chip/Chip';

const dotTone = { created: 'bg-accent', update: 'bg-fg-3', warn: 'bg-warn' } as const;

export function RecordHud({ entries, id, status, statusTone }: Readonly<{
  entries: readonly IncidentHistoryEntry[];
  id: string;
  status: string;
  statusTone: IncidentTone;
}>) {
  const { t } = useTranslation('incidents');
  const [open, setOpen] = useState(true);
  const seeded = incidentHistorySeed(id).map((entry) => ({
    ...entry,
    text: t(entry.textKey),
  }));
  const shown = [...seeded, ...entries].reverse();

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <button
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-2.5 bg-raised px-4 py-[13px] text-start"
        onClick={() => { setOpen((value) => !value); }}
        type="button"
      >
        <Clock aria-hidden className="text-accent" size={15} />
        <span className="text-sm-plus font-semibold">{t('history.title')}</span>
        <span className="num text-xs-plus font-semibold text-fg-3">{id}</span>
        <span className="ms-auto inline-flex items-center gap-2">
          <Chip tone={statusTone}>{status}</Chip>
          <Chip>{t('history.events', { count: shown.length })}</Chip>
          <ChevronDown aria-hidden className={open ? 'rotate-180 text-fg-4' : 'text-fg-4'} size={15} />
        </span>
      </button>
      {open ? (
        <div className="flex max-h-[300px] flex-col gap-3 overflow-y-auto border-t border-line px-4 py-3.5">
          {shown.map((entry, index) => (
            <div className="flex items-start gap-2.5" key={`${entry.text}-${String(index)}`}>
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotTone[entry.tone]}`} />
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold">{entry.text}</div>
                <div className="mt-0.5 text-xs-plus text-fg-3">{`${entry.by} · ${entry.when}`}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
