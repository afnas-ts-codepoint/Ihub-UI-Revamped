import type { QuotationCurrency } from '../types/purchasing.types';

/** Static prototype CBK reference table. Never replace with live rates. */
export const CBK_RATES_KWD = {
  AED: 0.0836,
  EUR: 0.334,
  GBP: 0.392,
  KWD: 1,
  SAR: 0.0819,
  USD: 0.307,
} as const satisfies Readonly<Record<QuotationCurrency, number>>;

export const QUOTATION_CURRENCIES = Object.keys(CBK_RATES_KWD) as QuotationCurrency[];

/** @prototype index.html:L10455 `qConvOf` */
export function convertQuotationAmountToKwd(amount: string, currency: QuotationCurrency): number | null {
  const parsed = Number.parseFloat(amount.replaceAll(',', ''));
  return Number.isFinite(parsed) ? parsed * CBK_RATES_KWD[currency] : null;
}

export function formatQuotationKwd(value: number | null): string {
  return value == null
    ? ''
    : value.toLocaleString('en-US', { maximumFractionDigits: 3, minimumFractionDigits: 3 });
}

export function automaticQuotationKwd(amount: string, currency: QuotationCurrency): string {
  return formatQuotationKwd(convertQuotationAmountToKwd(amount, currency));
}
