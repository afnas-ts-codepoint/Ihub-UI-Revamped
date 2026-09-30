import { Download } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ACTION_SHEET_DEPARTMENTS, ACTION_SHEET_YEARS } from '../data/actionSheet.mock';
import { paymentSettlementButtonStyles } from './actionSheetButtonStyles';
import { PaymentSettlementSectionHeading } from './PaymentSettlementSectionHeading';

const inputClass = 'w-full rounded-lg border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none focus:border-accent';

/**
 * Permanent inert placeholder with no chart/table, matching the
 * M3.9/M6.1/M6.2/M6.3 report-placeholder precedent. Unlike the Purchasing
 * report segments, the prototype's Action Sheet `reportView` renders its own
 * bespoke filter fields rather than the shared `RecordFilter`, and neither
 * "Generate report" nor "Export to Excel" has an `onClick` in the source —
 * both stay inert (`PROTOTYPE-NOOP(D2)`).
 * @prototype index.html:L17268-L17285 `reportView`
 */
export function ActionSheetReportView() {
  const { t } = useTranslation('paymentSettlement');

  const select = (placeholder: string, options: readonly string[]) => (
    <select className={inputClass} defaultValue="">
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );

  const field = (label: string, control: ReactNode) => (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">{label}</span>
      {control}
    </label>
  );

  return (
    <>
      <PaymentSettlementSectionHeading subtitle={t('actionSheet.report.subtitle')} title={t('actionSheet.report.title')} />
      <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-[22px]">
        <h3 className="m-0 text-sm-plus font-semibold">{t('actionSheet.report.filters')}</h3>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
          {field(t('actionSheet.report.fields.year'), select(t('actionSheet.report.select.year'), ACTION_SHEET_YEARS))}
          {field(t('actionSheet.report.fields.department'), select(t('actionSheet.report.select.department'), ACTION_SHEET_DEPARTMENTS))}
          {field(t('actionSheet.report.fields.sheetType'), select(t('actionSheet.report.select.sheetType'), [t('actionSheet.create.sheetType.regular'), t('actionSheet.create.sheetType.scheduled')]))}
          {field(t('actionSheet.report.fields.status'), select(t('actionSheet.report.select.status'), ['Draft', 'Submitted', 'Returned', 'Paid']))}
          {field(t('actionSheet.report.fields.from'), <input className={inputClass} type="date" />)}
          {field(t('actionSheet.report.fields.to'), <input className={inputClass} type="date" />)}
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button className={`${paymentSettlementButtonStyles.primary} self-start`} type="button">
            {t('actionSheet.report.generate')}
          </button>
          <button className={paymentSettlementButtonStyles.secondary} type="button">
            <Download aria-hidden="true" size={15} />
            {t('actionSheet.report.export')}
          </button>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-line-strong bg-canvas p-[60px] text-center text-sm text-fg-3">
        {t('actionSheet.report.placeholder')}
      </div>
    </>
  );
}
