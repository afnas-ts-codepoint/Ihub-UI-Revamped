import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NotificationLogTable } from '../components/NotificationLogTable';
import { notificationLogStatusKeys } from '../domain/status';
import { useNotificationLog } from '../hooks/useNotificationLog';
import {
  createEmptyRecordFilter,
  RecordFilter,
  type RecordExportDefinition,
} from '@/features/organization';

/** @prototype index.html:L12032-L12111 NotificationsScreen */
export function NotificationsPage() {
  const { t } = useTranslation('notifications');
  const { rows } = useNotificationLog();
  const [filter, setFilter] = useState(createEmptyRecordFilter);
  const exportDefinition: RecordExportDefinition = {
    columns: [
      t('columns.email'),
      t('columns.subject'),
      t('columns.status'),
      t('columns.type'),
      t('columns.date'),
    ],
    label: t('title'),
    rows: rows.map((row) => [
      row.email,
      row.subject,
      t(`status.${notificationLogStatusKeys[row.status]}`),
      row.type,
      row.date,
    ]),
  };

  return (
    <section className="flex flex-col gap-5">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-6">
        <h1 className="display m-0 text-10xl leading-[1.1] font-medium tracking-[-0.025em]">
          {t('title')}
        </h1>
      </header>
      <RecordFilter
        exportDefinition={exportDefinition}
        kind="history"
        onChange={setFilter}
        value={filter}
      />
      <NotificationLogTable rows={rows} />
    </section>
  );
}
