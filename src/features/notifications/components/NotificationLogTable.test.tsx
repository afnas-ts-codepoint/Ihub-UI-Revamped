import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { NotificationLogTable } from './NotificationLogTable';
import { notificationLog } from '../data/notification-log.mock';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

describe('NotificationLogTable', () => {
  it('matches the prototype All/Unread tabs and literal Unread count', () => {
    render(<NotificationLogTable rows={notificationLog} />);

    expect(
      screen.getAllByRole('tab').map((tab) => tab.textContent),
    ).toEqual(['All5', 'Unread3']);
    expect(screen.getByRole('tab', { name: 'All 5' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('does not filter rows or recompute the Unread count from row data', async () => {
    const user = userEvent.setup();
    render(<NotificationLogTable rows={notificationLog} />);

    expect(notificationLog).toHaveLength(5);
    await user.click(screen.getByRole('tab', { name: 'Unread 3' }));
    expect(screen.getByRole('tab', { name: 'Unread 3' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.getByText('CEO sign-off — Cleaning vendor renewal')).toBeVisible();
  });

  it('matches the prototype columns, rows, and email-status pills', () => {
    render(<NotificationLogTable rows={notificationLog} />);

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual(['Email', 'Subject', 'Email Status', 'Type', 'Date']);

    const delivered = screen.getByRole('row', {
      name: /ahmad\.r@tamdeen\.com Approval needed — Q2 Marketing Budget Delivered Approval Apr 28, 9:12 AM/,
    });
    const read = screen.getByRole('row', {
      name: /Daily checklist summary — SAMA Mall Read Digest/,
    });
    const bounced = screen.getByRole('row', {
      name: /CEO sign-off — Cleaning vendor renewal Bounced Approval/,
    });

    expect(within(delivered).getByText('Delivered')).toHaveClass(
      'chip-tone-ok',
    );
    expect(within(read).getByText('Read')).toHaveClass('border-line-strong');
    expect(within(bounced).getByText('Bounced')).toHaveClass('chip-tone-bad');
    expect(screen.getByText('Showing 5 of 5 records')).toBeVisible();
  });

  it('preserves the prototype English table wording in Arabic mode', async () => {
    await i18n.changeLanguage('ar');
    render(<NotificationLogTable rows={notificationLog} />);

    expect(screen.getByRole('tab', { name: 'All 5' })).toBeVisible();
    expect(
      screen.getByRole('columnheader', { name: 'Email Status' }),
    ).toBeVisible();
  });
});
