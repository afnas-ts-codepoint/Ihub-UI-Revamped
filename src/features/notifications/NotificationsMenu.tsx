import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { normalizeLocale } from '@/shared/i18n/i18n';
import { getLocalizedText } from '@/shared/i18n/localized';
import { Icon } from '@/shared/ui/icon/Icon';

import { useNotifications } from './hooks/useNotifications';
import type { NotificationTone } from './notifications.types';

type NotificationsMenuProps = Readonly<{ onViewAll: () => void }>;
type NotificationTab = 'all' | 'unread';

const toneClass: Record<NotificationTone, string> = {
  accent: 'chip-tone-accent',
  bad: 'chip-tone-bad',
  neutral: 'border-line-strong bg-inset text-fg-2',
  warn: 'chip-tone-warn',
};

/** @prototype index.html:L3346-L3372 NotificationsBell */
export function NotificationsMenu({ onViewAll }: NotificationsMenuProps) {
  const { i18n, t } = useTranslation('common');
  const locale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);
  const { data: items } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<NotificationTab>('all');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const unreadCount = items.filter((item) => item.isUnread).length;
  const visibleItems = useMemo(
    () => (tab === 'unread' ? items.filter((item) => item.isUnread) : items),
    [items, tab],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  const tabButton = (id: NotificationTab, count: number) => (
    <button
      aria-label={t(`topBar.notifications.tabs.${id}Count`, { count })}
      aria-pressed={tab === id}
      className="flex-1 rounded-compact px-2 py-1.5 text-sm-plus font-medium text-fg-2 aria-pressed:bg-surface aria-pressed:font-semibold aria-pressed:text-accent"
      data-count={count}
      onClick={() => {
        setTab(id);
      }}
      type="button"
    >
      {t(`topBar.notifications.tabs.${id}`)}
    </button>
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        aria-expanded={isOpen}
        aria-label={t('topBar.notifications.title')}
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-fg-2 hover:bg-inset hover:text-fg"
        data-testid="notifications-trigger"
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        title={t('topBar.notifications.title')}
        type="button"
      >
        <Icon name="bell" size={18} />
        {unreadCount ? (
          <span
            className="absolute end-1.5 top-1.5 h-[7px] w-[7px] rounded-full border-2 border-canvas bg-bad"
            data-testid="unread-indicator"
          />
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute end-0 top-[calc(100%+8px)] z-[61] w-[340px] max-w-[92vw] overflow-hidden rounded-xl border border-line-strong bg-surface shadow-popover">
          <div className="flex items-center justify-between gap-2.5 border-b border-line px-4 py-3">
            <span className="text-md font-semibold text-fg">
              {t('topBar.notifications.title')}
            </span>
            <button
              aria-label={t('topBar.notifications.close')}
              className="flex p-0.5 text-fg-4 hover:text-fg"
              onClick={() => {
                setIsOpen(false);
              }}
              type="button"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
          <div className="px-3 pt-2.5 pb-1">
            <div className="flex gap-0.5 rounded-menu border border-line bg-inset p-0.5">
              {tabButton('all', items.length)}
              {tabButton('unread', unreadCount)}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto px-2 pt-1.5 pb-2">
            {visibleItems.map((item) => (
              <div
                className="flex gap-2.5 rounded-lg px-2.5 py-2.5 data-[unread=true]:bg-raised"
                data-unread={item.isUnread}
                data-testid="notification-row"
                key={item.id}
              >
                <span
                  className={`mt-px h-fit shrink-0 rounded-full border px-2 py-0.5 text-2xs-plus font-semibold ${toneClass[item.tone]}`}
                >
                  {getLocalizedText(item.type, locale)}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-base leading-[1.35] font-medium text-fg data-[unread=true]:font-semibold"
                    data-unread={item.isUnread}
                  >
                    {getLocalizedText(item.subject, locale)}
                  </div>
                  <div className="mt-0.5 text-xs-plus text-fg-3">
                    {getLocalizedText(item.time, locale)}
                  </div>
                </div>
                {item.isUnread ? (
                  <span className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-accent" />
                ) : null}
              </div>
            ))}
          </div>
          <button
            className="w-full border-t border-line bg-surface p-3 text-base font-semibold text-accent"
            onClick={() => {
              setIsOpen(false);
              onViewAll();
            }}
            type="button"
          >
            {t('topBar.notifications.viewAll')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
