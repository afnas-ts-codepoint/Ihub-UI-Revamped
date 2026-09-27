import { toCsv } from '@/shared/file/csv';

import { activityMaster, budgetSheetCategories } from '../data/home-budgeting.mock';
import { HOME_BUDGET_SECTIONS, type HomeBudgetSection } from '../types/budgeting.types';

export type SheetTotals = Readonly<{
  budget: number;
  committed: number;
  forecast: number;
}>;

export const isHomeBudgetSection = (value: string | undefined): value is HomeBudgetSection =>
  value != null && HOME_BUDGET_SECTIONS.includes(value as HomeBudgetSection);

export const defaultHomeBudgetSection: HomeBudgetSection = 'sheet';

export const sheetForecast = (committed: number) =>
  Math.round((committed * 1.08) / 50) * 50;

export const sheetTotals = (
  rows: readonly Readonly<{ budget: number; committed: number; forecast: number }>[],
): SheetTotals =>
  rows.reduce<SheetTotals>(
    (total, row) => ({
      budget: total.budget + row.budget,
      committed: total.committed + row.committed,
      forecast: total.forecast + row.forecast,
    }),
    { budget: 0, committed: 0, forecast: 0 },
  );

export const usedPercent = (totals: SheetTotals) =>
  totals.budget ? Math.round((totals.committed / totals.budget) * 100) : 0;

export const budgetSheetExportRows = () =>
  budgetSheetCategories.flatMap((category) =>
    activityMaster
      .filter((activity) => category.activityCodes.includes(activity.code as never))
      .flatMap((activity) =>
        activity.subs.map((sub) => {
          const forecast = sheetForecast(sub.committed);
          return [
            category.name,
            activity.name,
            sub.name,
            sub.alloc,
            sub.committed,
            forecast,
            sub.alloc - sub.committed,
            sub.alloc - forecast,
            `${String(sub.alloc ? Math.round((sub.committed / sub.alloc) * 100) : 0)}%`,
          ] as const;
        }),
      ),
  );

export const BUDGET_SHEET_EXPORT_COLUMNS = [
  'Category',
  'Activity',
  'Sub-activity',
  'Budget',
  'Committed',
  'Forecast',
  'Available',
  'Variance',
  'Used %',
] as const;

export const budgetSheetCsv = () =>
  toCsv(BUDGET_SHEET_EXPORT_COLUMNS, budgetSheetExportRows());

export const BUDGET_SHEET_FILENAME = 'budget-sheet.csv';
export const BUDGET_SHEET_MIME = 'text/csv';
