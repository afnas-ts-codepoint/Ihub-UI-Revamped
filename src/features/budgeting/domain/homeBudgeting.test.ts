import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  BUDGET_SHEET_FILENAME,
  BUDGET_SHEET_MIME,
  budgetSheetCsv,
  budgetSheetExportRows,
  defaultHomeBudgetSection,
  isHomeBudgetSection,
  sheetForecast,
  sheetTotals,
  usedPercent,
} from './homeBudgeting';

describe('Home budgeting domain', () => {
  it('validates the exact route sections and defaults to the sheet', () => {
    expect(defaultHomeBudgetSection).toBe('sheet');
    expect(['sheet', 'activities', 'new-budget', 'additional-budget', 'transfer-fund', 'report'].every(isHomeBudgetSection)).toBe(true);
    expect(isHomeBudgetSection('dashboard')).toBe(false);
    expect(isHomeBudgetSection(undefined)).toBe(false);
  });

  it('matches the worksheet formulas used by the prototype', () => {
    expect(sheetForecast(11_200)).toBe(12_100);
    const totals = sheetTotals([
      { budget: 14_000, committed: 11_200, forecast: 12_100 },
      { budget: 8_000, committed: 5_600, forecast: 6_050 },
    ]);
    expect(totals).toEqual({ budget: 22_000, committed: 16_800, forecast: 18_150 });
    expect(usedPercent(totals)).toBe(76);
  });

  it('keeps the exact export contract', () => {
    expect(BUDGET_SHEET_FILENAME).toBe('budget-sheet.csv');
    expect(BUDGET_SHEET_MIME).toBe('text/csv');
    expect(budgetSheetExportRows()).toHaveLength(20);
  });

  it('matches the prototype-equivalent golden CSV byte-for-byte', () => {
    const golden = readFileSync(resolve(process.cwd(), 'src/features/budgeting/domain/__fixtures__/budget-sheet.csv'), 'utf8').replace(/\r\n/g, '\n').trimEnd();
    expect(budgetSheetCsv()).toBe(golden);
  });
});
