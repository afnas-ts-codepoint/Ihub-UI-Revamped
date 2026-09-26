import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { AppraisalTable } from './AppraisalTable';
import { appraisals } from '../data/appraisals.mock';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

describe('AppraisalTable', () => {
  it('matches the prototype tab, columns, rows, scores, and rating pills', () => {
    render(<AppraisalTable rows={appraisals} />);

    expect(
      screen.getByRole('tab', { name: 'All Appraisals 5' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual([
      'Appraisal #',
      'Employee',
      'Department',
      'Period',
      'Score',
      'Rating',
      'Reviewer',
    ]);

    expect(screen.getAllByRole('row')).toHaveLength(6);
    const first = screen.getByRole('row', {
      name: /APR-2025-118 Sara Al-Qahtani Marketing Q1 2025 4\.6 Exceeds A\. Al-Rashid/,
    });
    const neutral = screen.getByRole('row', {
      name: /APR-2025-116 Layla Haddad Marketing Q1 2025 3\.8 Meets A\. Al-Rashid/,
    });
    const last = screen.getByRole('row', {
      name: /APR-2025-114 Yousef Al-Mutairi IT Q1 2025 2\.9 Improve N\. Saleh/,
    });
    expect(within(first).getByText('APR-2025-118')).toBeVisible();
    expect(within(first).getByText('Sara Al-Qahtani')).toBeVisible();
    expect(within(first).getByText('4.6')).toHaveAttribute('data-band', 'ok');
    expect(within(first).getByText('Exceeds')).toHaveClass('chip-tone-ok');
    expect(within(neutral).getByText('3.8')).toHaveAttribute(
      'data-band',
      'neutral',
    );
    expect(within(neutral).getByText('Meets')).toHaveClass(
      'border-line-strong',
    );
    expect(within(last).getByText('2.9')).toHaveAttribute('data-band', 'bad');
    expect(within(last).getByText('Improve')).toHaveClass('chip-tone-warn');
    expect(screen.getByText('Showing 5 of 5 records')).toBeVisible();
  });

  it('preserves the prototype English table wording in Arabic mode', async () => {
    await i18n.changeLanguage('ar');
    render(<AppraisalTable rows={appraisals} />);

    expect(screen.getByRole('tab', { name: 'All Appraisals 5' })).toBeVisible();
    expect(
      screen.getByRole('columnheader', { name: 'Appraisal #' }),
    ).toBeVisible();
  });
});
