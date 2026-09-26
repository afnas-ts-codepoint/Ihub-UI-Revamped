import { useTranslation } from 'react-i18next';

import { NOTIFICATION_LOG_UNREAD_DISPLAY_COUNT } from '../data/notification-log.mock';
import {
  notificationLogStatusKeys,
  notificationLogStatusTones,
} from '../domain/status';
import type { NotificationLogEntry } from '../types/notification-log.types';
import { Chip } from '@/shared/ui/chip/Chip';
import { TabbedTable, type TableColumn } from '@/shared/table';

type NotificationLogTableProps = Readonly<{
  rows: readonly NotificationLogEntry[];
}>;

/** @prototype index.html:L12032-L12111 NotificationsScreen */
export function NotificationLogTable({ rows }: NotificationLogTableProps) {
  const { t } = useTranslation('notifications');
  const columns: readonly TableColumn<NotificationLogEntry>[] = [
    { key: 'email', label: t('columns.email') },
    { key: 'subject', label: t('columns.subject'), wrap: true },
    {
      key: 'status',
      label: t('columns.status'),
      render: (row) => (
        <Chip
          className="px-[9px] py-0.5 text-xs"
          tone={notificationLogStatusTones[row.status]}
        >
          {t(`status.${notificationLogStatusKeys[row.status]}`)}
        </Chip>
      ),
    },
    { key: 'type', label: t('columns.type'), muted: true },
    { key: 'date', label: t('columns.date'), muted: true },
  ];

  return (
    <TabbedTable
      columns={columns}
      emptyDescription={t('empty.description')}
      emptyTitle={t('empty.title')}
      paginationLabels={{
        next: t('pagination.next'),
        page: t('pagination.page'),
        previous: t('pagination.previous'),
        summary: t('pagination.summary', {
          shown: rows.length,
          total: rows.length,
        }),
      }}
      rows={rows}
      tabs={[
        { id: 'all', count: rows.length, label: t('tabs.all') },
        {
          id: 'unread',
          count: NOTIFICATION_LOG_UNREAD_DISPLAY_COUNT,
          label: t('tabs.unread'),
        },
      ]}
    />
  );
}
