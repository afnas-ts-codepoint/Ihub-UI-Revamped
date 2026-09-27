import { useTranslation } from 'react-i18next';

import { BudgetDashboard } from '../components/BudgetDashboard';
import { BudgetingWorkspace } from '../components/BudgetingWorkspace';
import { useBudgeting } from '../hooks/useBudgeting';
import type { BudgetSection } from '../types/budgeting.types';

/** @prototype index.html:L11309-L11666 BudgetingScreen, rendered section mode only. */
export function BudgetingPage({
  section,
}: Readonly<{ section: BudgetSection }>) {
  const { i18n, t } = useTranslation('budgeting');
  const { data } = useBudgeting();
  const isArabic = i18n.resolvedLanguage === 'ar';

  return (
    <section>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <h1 className="display m-0 text-10xl leading-[1.1] font-medium tracking-[-0.025em]">
          {isArabic ? (
            t('title')
          ) : (
            <>
              {t('titleStart')}{' '}
              <em className="accent-em">{t('titleEmphasis')}</em>
            </>
          )}
        </h1>
      </header>
      {section === 'dashboard' ? (
        <BudgetDashboard chart={data.dashboardBudgetChart} />
      ) : (
        <BudgetingWorkspace
          balanceChart={data.balanceChart}
          balanceRows={data.departmentBalances}
          requestRows={data.budgetRequests}
        />
      )}
    </section>
  );
}
