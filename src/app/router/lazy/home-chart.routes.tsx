import { useParams } from 'react-router';

import { NotFoundPage } from '@/app/router/NotFoundPage';
import {
  defaultHomeBudgetSection,
  HomeBudgetingPage,
  isHomeBudgetSection,
} from '@/features/budgeting';
import { CompanyPage, OverviewPage } from '@/features/home';

export function OverviewRoute() {
  return <OverviewPage />;
}

export function CompanyRoute() {
  return <CompanyPage />;
}

export function HomeBudgetingRoute() {
  const { section } = useParams<{ section?: string }>();

  if (section == null) {
    return <HomeBudgetingPage section={defaultHomeBudgetSection} />;
  }

  return isHomeBudgetSection(section) ? (
    <HomeBudgetingPage section={section} />
  ) : (
    <NotFoundPage />
  );
}
