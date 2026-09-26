import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ChecklistTable } from './ChecklistTable';
import { CHECKLIST_TABS, checklistRecords } from '../data/checklists.mock';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

describe('ChecklistTable', () => {
  it('matches the two prototype tabs, literal counts, order, and default state', () => {
    render(<ChecklistTable rows={checklistRecords} tabs={CHECKLIST_TABS} />);

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Unapproved Checklist4',
      'Other Checklist23',
    ]);
    expect(
      screen.getByRole('tab', { name: 'Unapproved Checklist 4' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('switches tabs without filtering rows or recomputing literal counts', async () => {
    const user = userEvent.setup();
    render(<ChecklistTable rows={checklistRecords} tabs={CHECKLIST_TABS} />);

    await user.click(screen.getByRole('tab', { name: 'Other Checklist 23' }));

    expect(
      screen.getByRole('tab', { name: 'Other Checklist 23' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByRole('row')).toHaveLength(5);
    expect(screen.getByText('CHK-0421')).toBeVisible();
    expect(screen.getByText('Vendor compliance audit')).toBeVisible();
  });

  it('matches the prototype columns, rows, progress, and status tones', () => {
    render(<ChecklistTable rows={checklistRecords} tabs={CHECKLIST_TABS} />);

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual([
      'Checklist #',
      'Title',
      'Site',
      'Submitted',
      'Submitted by',
      'Progress',
      'Status',
    ]);

    const awaiting = screen.getByRole('row', {
      name: /CHK-0421 Daily safety walk — Mall floor 1 SAMA Mall Today, 8:12 AM K\. Ibrahim 24\/24 Awaiting/,
    });
    const approved = screen.getByRole('row', {
      name: /CHK-0419 Fire drill verification SAMA Mall Apr 28 O\. Najjar 12\/12 Approved/,
    });

    expect(within(awaiting).getByText('Awaiting')).toHaveClass(
      'chip-tone-warn',
    );
    expect(within(approved).getByText('Approved')).toHaveClass('chip-tone-ok');
    expect(within(awaiting).getByText('24/24')).toHaveClass('num');
    expect(screen.getByText('Showing 4 of 4 records')).toBeVisible();
  });

  it('preserves the prototype English table wording in Arabic mode', async () => {
    await i18n.changeLanguage('ar');
    render(<ChecklistTable rows={checklistRecords} tabs={CHECKLIST_TABS} />);

    expect(
      screen.getByRole('tab', { name: 'Unapproved Checklist 4' }),
    ).toBeVisible();
    expect(
      screen.getByRole('columnheader', { name: 'Submitted by' }),
    ).toBeVisible();
  });
});
