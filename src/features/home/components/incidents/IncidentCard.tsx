import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Icon, type IconName } from '@/shared/ui/icon/Icon';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@/shared/ui/overlay/DropdownMenu';

import type { QueueIncident, QueueIncidentVerb } from '../../types/queue.types';
import { actionButtonClass } from '../actions/actionButtonStyles';
import {
  SEVERITY_TONE,
  SLA_TEXT_TONE,
  capitalise,
} from '../workflow-drawer/drawerTones';

/** The menu verbs of an incident (the pin button emits `pin`, a row click `read`). */
export type IncidentMenuVerb = Extract<
  QueueIncidentVerb,
  'callback' | 'close' | 'compensate' | 'feedback' | 'investigate' | 'task' | 'track'
>;

export type IncidentCardProps = Readonly<{
  incident: QueueIncident;
  onAct: (verb: QueueIncidentVerb, incident: QueueIncident) => void;
  onOpen: (incident: QueueIncident) => void;
}>;

const MENU: readonly Readonly<{ icon: IconName; id: IncidentMenuVerb }>[] = [
  { icon: 'trend', id: 'track' },
  { icon: 'wallet', id: 'compensate' },
  { icon: 'folder', id: 'task' },
  { icon: 'search', id: 'investigate' },
  { icon: 'mail', id: 'feedback' },
  { icon: 'phone', id: 'callback' },
  { icon: 'check', id: 'close' },
];

function MetaDot() {
  return (
    <span aria-hidden="true" className="text-line-strong">
      {'·'}
    </span>
  );
}

/**
 * One incident row: severity stripe, unread dot, SLA caption, a pin toggle and
 * the Action menu (track, compensate, raise a task, investigate, feedback,
 * callback, close case). A body click marks it read and opens the drawer.
 * @prototype index.html:L13589-L13718 `IncidentCard`
 */
export function IncidentCard({ incident, onAct, onOpen }: IncidentCardProps) {
  const { t } = useTranslation('home');
  const unread = !incident.read;
  const tone = SEVERITY_TONE[incident.severity];
  const open = () => {
    onAct('read', incident);
    onOpen(incident);
  };
  const onBodyKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  };

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg py-3.5 pe-3.5 ps-0 transition-colors',
        unread && 'bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]',
      )}
      data-testid={`incident-card-${incident.id}`}
    >
      <span
        aria-hidden="true"
        className={cn('ms-0.5 w-[3px] shrink-0 rounded-[3px]', tone.bar)}
      />
      <div className="min-w-0 flex-1">
        <div
          className="cursor-pointer"
          data-testid="incident-card-body"
          onClick={open}
          onKeyDown={onBodyKeyDown}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center gap-2">
            {unread ? (
              <span
                className="size-2 shrink-0 rounded-full bg-accent"
                data-testid="incident-unread-dot"
                title={t('incidentCard.unread')}
              />
            ) : null}
            <span className={cn('flex', tone.text)}>
              <Icon name={incident.icon} size={16} />
            </span>
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-md',
                unread ? 'font-bold text-fg' : 'font-semibold text-fg-2',
              )}
            >
              {incident.title}
            </span>
            {incident.pinned ? (
              <Icon className="shrink-0 text-accent" name="pin" size={13} />
            ) : null}
          </div>
          <div className="mt-[5px] flex flex-wrap items-center gap-[7px] text-sm text-fg-3">
            <span className="num text-fg-4">{incident.id}</span>
            <MetaDot />
            <span className={cn('font-semibold', tone.text)}>
              {capitalise(incident.severity)}
            </span>
            <MetaDot />
            <span>{incident.status}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-[7px] text-sm">
            <span
              className={cn(
                'inline-flex items-center gap-1 font-medium',
                SLA_TEXT_TONE[incident.sla],
              )}
            >
              {incident.sla !== 'ok' ? <Icon name="clock" size={12} /> : null}
              {incident.slaLabel}
            </span>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1">
          {/* The prototype's pin tooltip is hard-coded English in every locale. */}
          <button
            aria-label={incident.pinned ? t('incidentCard.unpin') : t('incidentCard.pin')}
            aria-pressed={incident.pinned}
            className={cn(
              actionButtonClass('ghost', 'sm'),
              'px-[7px]',
              incident.pinned ? 'bg-accent-dim text-accent' : 'text-fg-3',
            )}
            onClick={() => {
              onAct('pin', incident);
            }}
            title={incident.pinned ? t('incidentCard.unpin') : t('incidentCard.pin')}
            type="button"
          >
            <Icon name="pin" size={15} />
          </button>
          <div className="flex-1" />
          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(actionButtonClass('secondary', 'sm'), 'px-3')}
                title={t('incidentCard.action')}
                type="button"
              >
                <Icon name="dots" size={15} />
                {t('incidentCard.action')}
                <Icon className="ms-0.5" name="chevron-down" size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[234px] rounded-xl p-1.5">
              <div className="px-2.5 pt-1.5 pb-1 text-xs font-semibold tracking-[0.06em] text-fg-4 uppercase">
                {t('incidentCard.actions')}
              </div>
              {MENU.map((entry) => (
                <DropdownMenuItem
                  className={cn(
                    'gap-2.5 px-2.5 py-[9px] text-base',
                    entry.id === 'close' && 'text-bad',
                  )}
                  key={entry.id}
                  onSelect={() => {
                    onAct(entry.id, incident);
                  }}
                >
                  <Icon
                    className={cn(
                      'shrink-0',
                      entry.id === 'close' ? 'text-bad' : 'text-fg-3',
                    )}
                    name={entry.icon}
                    size={15}
                  />
                  {t(`incidentCard.menu.${entry.id}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </div>
      </div>
    </div>
  );
}
