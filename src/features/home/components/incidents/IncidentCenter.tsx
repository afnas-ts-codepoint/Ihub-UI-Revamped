import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

import { matchesQuery } from '../../domain/assignedQueue';
import { rankIncidents } from '../../domain/prioritization';
import type { QueueIncident, QueueIncidentVerb } from '../../types/queue.types';
import { HomeSectionHead } from '../sections/HomeSectionHead';
import { IncidentCard } from './IncidentCard';

export type IncidentCenterProps = Readonly<{
  incidents: readonly QueueIncident[];
  onAct: (verb: QueueIncidentVerb, incident: QueueIncident) => void;
  onOpen: (incident: QueueIncident) => void;
}>;

/**
 * Incidents ranked by `scoreIncident`, with a search box, an unread count and
 * the breached-SLA count.
 * @prototype index.html:L13719-L13766 `IncidentCenter`
 */
export function IncidentCenter({
  incidents,
  onAct,
  onOpen,
}: IncidentCenterProps) {
  const { t } = useTranslation('home');
  const [query, setQuery] = useState('');
  const ranked = useMemo(() => rankIncidents(incidents), [incidents]);
  const shown = useMemo(
    () =>
      ranked.filter((incident) =>
        matchesQuery(query, [
          incident.title,
          incident.id,
          incident.owner,
          incident.location,
          incident.status,
        ]),
      ),
    [query, ranked],
  );
  const unread = incidents.filter((incident) => !incident.read).length;
  const breached = incidents.filter((incident) => incident.sla === 'breached').length;

  return (
    <div className="rounded-lg border border-line bg-surface p-5" data-testid="incident-center">
      <HomeSectionHead
        right={
          <span className="inline-flex items-center gap-1.5">
            {unread ? (
              <Chip className="px-[9px] py-[3px] text-xs font-medium" tone="accent">
                {`${String(unread)} ${t('incidentCenter.unread')}`}
              </Chip>
            ) : null}
            <Chip className="px-[9px] py-[3px] text-xs font-medium" tone="bad">
              {`${String(breached)} ${t('incidentCenter.sla')}`}
            </Chip>
          </span>
        }
        title={t('incidentCenter.title')}
      />
      <div className="relative mb-1.5">
        <Icon
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-fg-4"
          name="search"
          size={15}
        />
        <input
          aria-label={t('incidentCenter.searchPlaceholder')}
          className="box-border w-full rounded-lg border border-line-strong bg-raised py-[9px] ps-9 pe-3 text-base text-fg"
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder={t('incidentCenter.searchPlaceholder')}
          value={query}
        />
      </div>
      <div className="flex flex-col">
        {shown.map((incident, index) => (
          <div
            className={index ? 'border-t border-line' : undefined}
            key={incident.id}
          >
            <IncidentCard incident={incident} onAct={onAct} onOpen={onOpen} />
          </div>
        ))}
        {shown.length === 0 ? (
          <div className="py-6 text-center text-base text-fg-3">
            {query.trim() ? t('incidentCenter.noMatches') : t('incidentCenter.noOpen')}
          </div>
        ) : null}
      </div>
    </div>
  );
}
