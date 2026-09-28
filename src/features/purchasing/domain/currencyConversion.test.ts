import { describe, expect, it } from 'vitest';

import { automaticQuotationKwd, CBK_RATES_KWD, convertQuotationAmountToKwd, formatQuotationKwd } from './currencyConversion';

describe('M6.5 prototype currency conversion', () => {
  it('keeps the exact static CBK reference table', () => {
    expect(CBK_RATES_KWD).toEqual({ AED: 0.0836, EUR: 0.334, GBP: 0.392, KWD: 1, SAR: 0.0819, USD: 0.307 });
  });

  it.each([
    ['100', 'USD', 30.7, '30.700'],
    ['1,250', 'EUR', 417.5, '417.500'],
    ['10,000', 'AED', 836, '836.000'],
    ['99.999', 'GBP', 39.199608, '39.200'],
    ['0', 'SAR', 0, '0.000'],
    ['1,234.5678', 'KWD', 1234.5678, '1,234.568'],
  ] as const)('converts %s %s by multiplication and formats three decimals', (amount, currency, raw, displayed) => {
    expect(convertQuotationAmountToKwd(amount, currency)).toBeCloseTo(raw, 8);
    expect(automaticQuotationKwd(amount, currency)).toBe(displayed);
  });

  it('preserves parseFloat and invalid/empty semantics', () => {
    expect(automaticQuotationKwd('', 'USD')).toBe('');
    expect(automaticQuotationKwd('invalid', 'USD')).toBe('');
    expect(automaticQuotationKwd('12abc', 'USD')).toBe('3.684');
    expect(formatQuotationKwd(null)).toBe('');
  });
});
