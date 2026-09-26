import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { OvertimeTable } from './OvertimeTable';
import { OVERTIME_TABS, overtimeRecords } from '../data/overtime.mock';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

describe('OvertimeTable', () => {
  it('matches the prototype seven tabs, literal counts, and tab order', () => {
    render(<OvertimeTable rows={overtimeRecords} tabs={OVERTIME_TABS} />);

    expect(
      screen.getAllByRole('tab').map((tab) => tab.textContent),
    ).toEqual([
      'To Do14',
      'Verify6',
      'Edit3',
      'Correction2',
      'Above/No Budget4',
      'Justification1',
      'Record Listing92',
    ]);
    expect(screen.getByRole('tab', { name: 'To Do 14' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('does not recompute tab counts from the row data', () => {
    render(<OvertimeTable rows={overtimeRecords} tabs={OVERTIME_TABS} />);

    expect(overtimeRecords).toHaveLength(6);
    expect(screen.getByRole('tab', { name: 'To Do 14' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Record Listing 92' })).toBeVisible();
  });

  it('switches the active tab without changing the displayed rows', async () => {
    const user = userEvent.setup();
    render(<OvertimeTable rows={overtimeRecords} tabs={OVERTIME_TABS} />);

    await user.click(screen.getByRole('tab', { name: 'Verify 6' }));
    expect(screen.getByRole('tab', { name: 'Verify 6' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getAllByRole('row')).toHaveLength(7);
    expect(screen.getByText('OT-2451')).toBeVisible();
  });

  it('matches the prototype columns, rows, and status pills', () => {
    render(<OvertimeTable rows={overtimeRecords} tabs={OVERTIME_TABS} />);

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual([
      'OT #',
      'Employee',
      'Department',
      'Date',
      'Hours',
      'Amount (KWD)',
      'Status',
      '',
    ]);

    const pending = screen.getByRole('row', {
      name: /OT-2451 Khaled Ibrahim Operations Apr 28 4\.5 180\.00 Pending/,
    });
    const wholeHour = screen.getByRole('row', {
      name: /OT-2450 Layla Haddad Marketing Apr 28 3 142\.50 Approved/,
    });
    const aboveBudget = screen.getByRole('row', {
      name: /OT-2448 Sara Al-Qahtani Marketing Apr 27 2\.5 125\.00 Above budget/,
    });
    const verified = screen.getByRole('row', {
      name: /OT-2446 Rania Salem HR Apr 26 1\.5 64\.00 Verified/,
    });

    expect(within(pending).getByText('Pending')).toHaveClass('chip-tone-warn');
    expect(within(wholeHour).getByText('3')).toBeVisible();
    expect(within(aboveBudget).getByText('Above budget')).toHaveClass(
      'chip-tone-bad',
    );
    expect(within(verified).getByText('Verified')).toHaveClass('chip-tone-ok');
    expect(
      within(pending).getByRole('button', { name: 'View' }),
    ).toBeVisible();
    expect(
      within(pending).getByRole('button', { name: 'Edit' }),
    ).toBeVisible();
    expect(screen.getByText('Showing 6 of 6 records')).toBeVisible();
  });

  it('preserves the prototype English table wording in Arabic mode', async () => {
    await i18n.changeLanguage('ar');
    render(<OvertimeTable rows={overtimeRecords} tabs={OVERTIME_TABS} />);

    expect(screen.getByRole('tab', { name: 'To Do 14' })).toBeVisible();
    expect(
      screen.getByRole('columnheader', { name: 'Amount (KWD)' }),
    ).toBeVisible();
  });
});
