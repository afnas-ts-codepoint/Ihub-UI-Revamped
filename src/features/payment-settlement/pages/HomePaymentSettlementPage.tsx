import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import { paths } from '@/shared/config/paths';
import { MigrationPending } from '@/shared/ui/feedback/MigrationPending';

import { HOME_PAYMENT_SETTLEMENT_MODULES, type HomePaymentSettlementModule } from '../types/paymentSettlement.types';
import { ActionSheetSection } from '../components/ActionSheetSection';
import { PettyCashSection } from '../components/PettyCashSection';

const labelKeys = {
  'action-sheet': 'home.sections.action-sheet',
  'add-supplier': 'home.sections.add-supplier',
  'petty-cash': 'home.sections.petty-cash',
} as const satisfies Record<HomePaymentSettlementModule, string>;

/**
 * `action-sheet` (M6.6) and `petty-cash` (M6.7) are live. `add-supplier`
 * (M6.8) remains `MigrationPending`, matching the M8.1/M8.2 dashboard-tab
 * precedent of shipping the shell before every tab has real content.
 * @prototype index.html:L12707-L12727 the Payment Settlement tab strip
 * (`FilterChips` options `action-sheet` / `payment-settlement` (labelled
 * "Petty Cash") / `add-a-supplier`)
 */
export function HomePaymentSettlementPage({ module }: Readonly<{ module: HomePaymentSettlementModule }>) {
  const { t } = useTranslation('paymentSettlement');

  return (
    <section className="rise">
      <header className="mb-7">
        <h1 className="display m-0 text-10xl leading-[1.1] font-medium tracking-[-0.025em]">{t('home.title')}</h1>
      </header>
      <nav aria-label={t('home.sections.ariaLabel')} className="mb-[18px] flex flex-wrap gap-1 overflow-x-auto rounded-[10px] border border-line bg-raised p-0.5">
        {HOME_PAYMENT_SETTLEMENT_MODULES.map((item) => (
          <Link
            aria-current={module === item ? 'page' : undefined}
            className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap ${module === item ? 'bg-surface font-semibold text-accent shadow-sm' : 'bg-transparent text-fg-2'}`}
            key={item}
            to={paths.home.paymentSettlement(item)}
          >
            {t(labelKeys[item])}
          </Link>
        ))}
      </nav>
      {module === 'action-sheet' ? <ActionSheetSection /> : null}
      {module === 'petty-cash' ? <PettyCashSection /> : null}
      {module === 'add-supplier' ? <MigrationPending area={t(labelKeys[module])} /> : null}
    </section>
  );
}
