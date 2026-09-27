import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import { paths } from '@/shared/config/paths';

import { ActivityMasterView } from '../components/ActivityMasterView';
import { BudgetReport } from '../components/BudgetReport';
import { BudgetSheetView } from '../components/BudgetSheetView';
import { HomeBudgetRequestView } from '../components/HomeBudgetRequestView';
import { NewBudgetView } from '../components/NewBudgetView';
import { HOME_BUDGET_SECTIONS, type HomeBudgetSection } from '../types/budgeting.types';

const labelKeys = {
  activities: 'home.sections.activities',
  'additional-budget': 'home.sections.additionalBudget',
  'new-budget': 'home.sections.newBudget',
  report: 'home.sections.report',
  sheet: 'home.sections.sheet',
  'transfer-fund': 'home.sections.transferFund',
} as const satisfies Record<HomeBudgetSection, string>;

export function HomeBudgetingPage({ section }: Readonly<{ section: HomeBudgetSection }>) {
  const { t } = useTranslation('budgeting');

  return (
    <section className="rise">
      <header className="mb-7">
        <h1 className="display m-0 text-10xl leading-[1.1] font-medium tracking-[-0.025em]">{t('home.title')}</h1>
      </header>
      <nav aria-label={t('home.sections.ariaLabel')} className="mb-[18px] flex gap-1 overflow-x-auto border-b border-line">
        {HOME_BUDGET_SECTIONS.map((item) => (
          <Link
            aria-current={section === item ? 'page' : undefined}
            className={`-mb-px border-b-2 px-[13px] py-3 text-lg font-medium whitespace-nowrap ${section === item ? 'border-accent font-semibold text-fg' : 'border-transparent text-fg-3'}`}
            key={item}
            to={paths.home.budgets(item)}
          >
            {t(labelKeys[item])}
          </Link>
        ))}
      </nav>
      {section === 'sheet' ? <BudgetSheetView /> : null}
      {section === 'activities' ? <ActivityMasterView /> : null}
      {section === 'new-budget' ? <NewBudgetView /> : null}
      {section === 'additional-budget' || section === 'transfer-fund' ? <HomeBudgetRequestView /> : null}
      {section === 'report' ? <BudgetReport /> : null}
    </section>
  );
}
