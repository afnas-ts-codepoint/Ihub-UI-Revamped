import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createEmptyRecordFilter, RecordFilter } from '@/features/organization';

import { PurchasingSectionHeading } from './PurchasingSectionHeading';

/**
 * Permanent inert placeholder — no chart, no table, matching the M3.9/M6.1/
 * M6.2 report-placeholder precedent.
 * @prototype index.html:L10180-L10182 `reqReportBody`
 */
export function RequestReportView() {
  const { t } = useTranslation('purchasing');
  const [filter, setFilter] = useState(createEmptyRecordFilter);

  return (
    <>
      <PurchasingSectionHeading subtitle={t('report.subtitle')} title={t('report.title')} />
      <RecordFilter kind="request" noExport onChange={setFilter} value={filter} />
      <div className="rounded-xl border border-dashed border-line-strong bg-canvas p-[60px] text-center text-sm text-fg-3">
        {t('report.placeholder')}
      </div>
    </>
  );
}
