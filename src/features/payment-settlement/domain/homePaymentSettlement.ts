import { HOME_PAYMENT_SETTLEMENT_MODULES, type HomePaymentSettlementModule } from '../types/paymentSettlement.types';

export const isHomePaymentSettlementModule = (value: string | undefined): value is HomePaymentSettlementModule =>
  value != null && HOME_PAYMENT_SETTLEMENT_MODULES.includes(value as HomePaymentSettlementModule);

/** @prototype index.html:L17155 `React.useState('create')` (`ActionSheetSection` sub-tab). */
export const defaultHomePaymentSettlementModule: HomePaymentSettlementModule = 'action-sheet';
