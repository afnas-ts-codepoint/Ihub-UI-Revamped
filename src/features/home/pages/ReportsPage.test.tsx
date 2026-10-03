import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { Toaster } from '@/shared/ui/feedback/Toaster';

import { HOME_REPORT_CATEGORIES } from '../constants/reportCategories';
import { ReportsPage } from './ReportsPage';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
  document.documentElement.dir = 'ltr';
  await i18n.changeLanguage('en');
});

const pressed = (name: string) =>
  screen.getByRole('button', { name }).getAttribute('aria-pressed');

describe('HOME_REPORT_CATEGORIES', () => {
  it('holds the prototype catalogue of 7 categories and 17 reports', () => {
    expect(HOME_REPORT_CATEGORIES.map((category) => category.id)).toEqual([
      'hr',
      'workforce',
      'performance',
      'finance',
      'operations',
      'quality',
      'system',
    ]);
    expect(HOME_REPORT_CATEGORIES.map((category) => category.items.length)).toEqual([
      3, 2, 1, 4, 5, 1, 1,
    ]);
    expect(
      HOME_REPORT_CATEGORIES.reduce((sum, category) => sum + category.items.length, 0),
    ).toBe(17);
  });
});

describe('ReportsPage', () => {
  it('opens on HR > Attendance Summary under the prototype header', () => {
    render(<ReportsPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Analytics & Reports' }),
    ).toBeVisible();
    expect(
      screen.getByText(
        '17 standard reports across HR, Workforce, Finance, Operations, Quality and System.',
      ),
    ).toBeVisible();
    expect(pressed('HR')).toBe('true');
    expect(pressed('Attendance Summary')).toBe('true');
    expect(
      screen.getByRole('heading', { level: 3, name: 'Attendance Summary' }),
    ).toBeVisible();
    expect(
      screen.getByText('Run search to generate report. Result table will render here.'),
    ).toBeVisible();
  });

  it("shows only the active category's reports as chips", () => {
    render(<ReportsPage />);
    expect(screen.getByRole('button', { name: 'Attendance Detailed' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Leave Balance' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Overtime Summary' })).toBeNull();
  });

  it('resets to the first report of a category when its tab is chosen', async () => {
    const user = userEvent.setup();
    render(<ReportsPage />);
    await user.click(screen.getByRole('button', { name: 'Leave Balance' }));
    expect(pressed('Leave Balance')).toBe('true');

    await user.click(screen.getByRole('button', { name: 'Finance' }));
    expect(pressed('Finance')).toBe('true');
    expect(pressed('HR')).toBe('false');
    expect(pressed('Budget vs Actual')).toBe('true');
    expect(screen.getByRole('button', { name: 'Purchasing Pending' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Petty Cash Movement' }));
    expect(
      screen.getByRole('heading', { level: 3, name: 'Petty Cash Movement' }),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Operations' }));
    expect(pressed('Tasks')).toBe('true');
    expect(screen.getByRole('button', { name: 'Observations Register' })).toBeVisible();
  });

  it('exports an empty, English-named file for the selected report', async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => 'blob:report');
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    render(
      <>
        <ReportsPage />
        <Toaster />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Finance' }));
    await user.click(screen.getByRole('button', { name: 'Budget Utilisation' }));
    await user.click(screen.getByRole('button', { name: /Export/ }));
    await user.click(await screen.findByRole('menuitem', { name: 'CSV file' }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Exported budget-utilisation-export.csv')).toBeVisible();
  });

  it('offers the four export formats', async () => {
    const user = userEvent.setup();
    render(<ReportsPage />);
    await user.click(screen.getByRole('button', { name: /Export/ }));
    for (const name of ['Excel spreadsheet', 'CSV file', 'PDF document', 'Print']) {
      expect(await screen.findByRole('menuitem', { name })).toBeVisible();
    }
  });

  it('translates to Arabic', async () => {
    await i18n.changeLanguage('ar');
    render(<ReportsPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'التحليلات والتقارير' }),
    ).toBeVisible();
    expect(
      screen.getByText('شغّل البحث لإنشاء التقرير. سيظهر جدول النتائج هنا.'),
    ).toBeVisible();
    expect(pressed('الموارد البشرية')).toBe('true');
    expect(pressed('ملخص الحضور')).toBe('true');
    expect(screen.getByRole('heading', { level: 3, name: 'ملخص الحضور' })).toBeVisible();
  });
});
