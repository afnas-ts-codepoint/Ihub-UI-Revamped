import { Check, Coins, Edit, FileText, Folder, History, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionSheetForm } from './ActionSheetForm';
import { ActionSheetHistoryView } from './ActionSheetHistoryView';
import { ActionSheetMissingDocumentsView } from './ActionSheetMissingDocumentsView';
import { ActionSheetReportView } from './ActionSheetReportView';
import { EditActionSheetView } from './EditActionSheetView';
import { PaymentSettlementSectionHeading } from './PaymentSettlementSectionHeading';
import { PrePaymentsListingView } from './PrePaymentsListingView';
import { RecordingCostView } from './RecordingCostView';
import { segmentedOptionClass } from './actionSheetButtonStyles';

const SUBS = [
  { icon: Check, id: 'create' },
  { icon: Edit, id: 'edit' },
  { icon: Folder, id: 'missing' },
  { icon: Wallet, id: 'prepay' },
  { icon: Coins, id: 'cost' },
  { icon: History, id: 'history' },
  { icon: FileText, id: 'report' },
] as const;

type Sub = (typeof SUBS)[number]['id'];

/** @prototype index.html:L17153-L17299 `ActionSheetSection` */
export function ActionSheetSection() {
  const { t } = useTranslation('paymentSettlement');
  const [sub, setSub] = useState<Sub>('create');

  const content = (() => {
    if (sub === 'create') {
      return (
        <>
          <PaymentSettlementSectionHeading subtitle={t('actionSheet.create.subtitle')} title={t('actionSheet.create.title')} />
          <ActionSheetForm embedded />
        </>
      );
    }
    if (sub === 'edit') return <EditActionSheetView onEditRow={() => { setSub('create'); }} />;
    if (sub === 'missing') return <ActionSheetMissingDocumentsView />;
    if (sub === 'prepay') return <PrePaymentsListingView />;
    if (sub === 'cost') return <RecordingCostView />;
    if (sub === 'history') return <ActionSheetHistoryView />;
    return <ActionSheetReportView />;
  })();

  return (
    <div className="flex flex-col gap-4.5" style={{ paddingBottom: 40 }}>
      <div className="mb-4 inline-flex w-fit flex-wrap gap-0.5 rounded-lg border border-line bg-inset p-0.5">
        {SUBS.map((item) => {
          const Icon = item.icon;
          const active = sub === item.id;
          return (
            <button className={`inline-flex items-center gap-1.5 ${segmentedOptionClass(active)}`} key={item.id} onClick={() => { setSub(item.id); }} type="button">
              <Icon aria-hidden="true" className={active ? 'text-accent' : 'text-fg-4'} size={14} />
              {t(`actionSheet.subs.${item.id}`)}
            </button>
          );
        })}
      </div>
      {content}
    </div>
  );
}
