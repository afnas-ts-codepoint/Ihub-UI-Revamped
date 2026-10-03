import { useParams } from 'react-router';

import { NotFoundPage } from '@/app/router/NotFoundPage';
import {
  HomePaymentSettlementPage,
  isHomePaymentSettlementModule,
} from '@/features/payment-settlement';
import {
  defaultHomePurchasingSection,
  HomePurchasingPage,
  isHomePurchasingSection,
} from '@/features/purchasing';

export function PaymentSettlementRoute() {
  const { module } = useParams<{ module?: string }>();
  return isHomePaymentSettlementModule(module) ? (
    <HomePaymentSettlementPage module={module} />
  ) : (
    <NotFoundPage />
  );
}

export function PurchasingRoute() {
  const { section } = useParams<{ section?: string }>();

  if (section == null) {
    return <HomePurchasingPage section={defaultHomePurchasingSection} />;
  }

  return isHomePurchasingSection(section) ? (
    <HomePurchasingPage section={section} />
  ) : (
    <NotFoundPage />
  );
}
