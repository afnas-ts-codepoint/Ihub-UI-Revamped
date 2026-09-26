import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ChecklistPage } from './ChecklistPage';
import arChecklists from '@/shared/i18n/locales/ar/checklists.json';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

describe('ChecklistPage', () => {
  it('uses the sheet RecordFilter and supports applied-chip removal and Clear all', async () => {
    const user = userEvent.setup();
    render(<ChecklistPage />);

    const search = screen.getByPlaceholderText(/AS-2026-114/);
    await user.type(search, 'CHK-0421');
    await user.click(screen.getByRole('button', { name: /Filters/ }));

    expect(screen.getByText('Subject / Action sheet number')).toBeVisible();
    expect(screen.getByText('Quick flags')).toBeVisible();
    expect(screen.getByText('Date range')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));

    expect(
      screen.getByRole('button', { name: 'Remove filter: CHK-0421' }),
    ).toBeVisible();
    await user.click(
      screen.getAllByRole('button', { name: 'Clear all' })[0] ?? document.body,
    );
    expect(search).toHaveValue('');
  });

  it('renders the prototype Arabic title and RTL-safe localized filter chrome', async () => {
    await i18n.changeLanguage('ar');
    render(<ChecklistPage />);

    expect(
      screen.getByRole('heading', { name: arChecklists.title }),
    ).toBeVisible();
    expect(screen.getByPlaceholderText(/AS-2026-114/)).toBeVisible();
    expect(i18n.dir()).toBe('rtl');
  });
});
