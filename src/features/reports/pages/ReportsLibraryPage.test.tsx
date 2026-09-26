import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ReportsLibraryPage } from './ReportsLibraryPage';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

describe('ReportsLibraryPage', () => {
  it('suppresses the source subtitle like the prototype while exposing the 18-report catalogue', async () => {
    const user = userEvent.setup();
    render(<ReportsLibraryPage />);

    expect(
      screen.queryByText(
        '17 standard reports across HR, Workforce, Finance, Operations, Quality and System.',
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Attendance Summary' }),
    ).toBeVisible();

    const selections: Record<string, readonly string[]> = {
      HR: ['Attendance Summary', 'Attendance Detailed', 'Leave Balance'],
      Workforce: ['Overtime Summary', 'Overtime Detailed'],
      Performance: ['Appraisal Summary'],
      Finance: [
        'Budget vs Actual',
        'Budget Utilisation',
        'Revenue Projection',
        'Purchasing Pending',
        'Petty Cash Movement',
      ],
      Operations: [
        'Tasks',
        'Violations Register',
        'Incident Log',
        'Enquiries Register',
        'Observations Register',
      ],
      Quality: ['Checklist Compliance'],
      System: ['Audit Trail'],
    };

    for (const [group, labels] of Object.entries(selections)) {
      await user.click(screen.getByRole('button', { name: group }));
      for (const label of labels) {
        expect(screen.getByRole('button', { name: label })).toBeVisible();
      }
      expect(screen.getByRole('heading', { name: labels[0] })).toBeVisible();
    }
  });

  it('changes only the selected preview context when a report is picked', async () => {
    const user = userEvent.setup();
    render(<ReportsLibraryPage />);
    await user.click(screen.getByRole('button', { name: 'Finance' }));
    await user.click(
      screen.getByRole('button', { name: 'Revenue Projection' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Revenue Projection' }),
    ).toBeVisible();
    expect(screen.getByText('Finance', { selector: 'p' })).toBeVisible();
  });

  it('keeps FilterForm fields, type controls, Cancel, and Search inert', async () => {
    const user = userEvent.setup();
    render(<ReportsLibraryPage />);
    const form = screen.getByTestId('reports-filter-form');
    const placeholder = screen.getByTestId('reports-preview-placeholder');
    const initialPreview = placeholder.textContent;

    expect(within(form).getByText('From')).toBeVisible();
    expect(within(form).getByText('To')).toBeVisible();
    expect(within(form).getByText('Department')).toBeVisible();
    expect(within(form).getByText('Site')).toBeVisible();
    expect(
      within(form).getByRole('button', { name: 'Summary' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(form).getByRole('button', { name: 'Detailed' }));
    await user.click(within(form).getByRole('button', { name: 'Cancel' }));
    await user.click(within(form).getByRole('button', { name: 'Search' }));

    expect(
      within(form).getByRole('button', { name: 'Summary' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(placeholder.textContent).toBe(initialPreview);
  });

  it('preserves English internal labels in Arabic while translating the header', async () => {
    await i18n.changeLanguage('ar');
    render(<ReportsLibraryPage />);
    expect(
      screen.getByRole('heading', { name: 'التحليلات والتقارير' }),
    ).toBeVisible();
    expect(
      screen.queryByText(
        '١٧ تقريراً معيارياً عبر الموارد البشرية والمالية والعمليات والجودة والنظام.',
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'HR' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Attendance Summary' }),
    ).toBeVisible();
    expect(screen.getByText('Department')).toBeVisible();
    expect(
      screen.getByText(
        'Run search to generate report. Result table will render here.',
      ),
    ).toBeVisible();
    expect(i18n.dir()).toBe('rtl');
  });
});
