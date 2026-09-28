import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { SnagListsPage } from './SnagListsPage';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

describe('M7.4 Snag Lists', () => {
  it('renders the exact five listing fixtures and literal counts', () => {
    render(<SnagListsPage view="listing" />);
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(6);
    for (const id of [
      'SNG-2026-041',
      'SNG-2026-039',
      'SNG-2026-036',
      'SNG-2026-033',
      'SNG-2026-028',
    ])
      expect(within(table).getByText(id)).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Open snags 3' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Closed 2' })).toBeVisible();
    expect(screen.getByText('Showing 5 of 5 records')).toBeVisible();
  });

  it('keeps the same five rows when switching the visual-only Open/Closed tabs', async () => {
    const user = userEvent.setup();
    render(<SnagListsPage view="listing" />);
    const table = screen.getByRole('table');
    await user.click(screen.getByRole('tab', { name: 'Closed 2' }));
    expect(screen.getByRole('tab', { name: 'Closed 2' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Open snags 3' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(within(table).getAllByRole('row')).toHaveLength(6);
    for (const id of [
      'SNG-2026-041',
      'SNG-2026-039',
      'SNG-2026-036',
      'SNG-2026-033',
      'SNG-2026-028',
    ])
      expect(within(table).getByText(id)).toBeVisible();
    await user.click(screen.getByRole('tab', { name: 'Open snags 3' }));
    await user.click(screen.getByRole('tab', { name: 'Closed 2' }));
    expect(within(table).getAllByRole('row')).toHaveLength(6);
    expect(within(table).getByText('SNG-2026-041')).toBeVisible();
  });

  it('gates Add Submit only on non-whitespace attachment captions', async () => {
    const user = userEvent.setup();
    const { container } = render(<SnagListsPage view="add" />);
    const submit = screen.getByRole('button', { name: 'Submit snag list' });
    expect(submit).toBeEnabled();
    const picker =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!picker) throw new Error('Expected Snag file picker');
    await user.upload(picker, new File(['photo'], 'snag.jpg'));
    expect(submit).toBeDisabled();
    const caption = screen.getByPlaceholderText('Caption (required)');
    await user.type(caption, '   ');
    expect(submit).toBeDisabled();
    await user.clear(caption);
    await user.type(caption, 'Handover photo');
    expect(submit).toBeEnabled();
    await user.click(submit);
    expect(screen.getByText('Snag list submitted')).toBeVisible();
    expect(
      screen.getByPlaceholderText(
        'What was snagged, where, and the condition found.',
      ),
    ).toHaveValue('');
  });

  it('preserves attachment append, removal, Clear, and Save draft behavior', async () => {
    const user = userEvent.setup();
    const { container } = render(<SnagListsPage view="add" />);
    const picker =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!picker) throw new Error('Expected Snag file picker');
    await user.upload(picker, [
      new File(['1'], 'one.jpg'),
      new File(['2'], 'two.jpg'),
    ]);
    expect(screen.getAllByPlaceholderText('Caption (required)')).toHaveLength(
      2,
    );
    const remove = screen.getAllByRole('button', { name: 'Remove' })[0];
    if (!remove) throw new Error('Expected attachment remove button');
    await user.click(remove);
    expect(screen.queryByText('one.jpg')).not.toBeInTheDocument();
    const remainingCaption = screen.getByPlaceholderText('Caption (required)');
    await user.type(remainingCaption, 'Second photo');
    expect(remainingCaption).toHaveValue('Second photo');
    await user.clear(remainingCaption);
    expect(
      screen.getByRole('button', { name: 'Submit snag list' }),
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.queryByText('two.jpg')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Submit snag list' }),
    ).toBeEnabled();
    await user.upload(picker, new File(['3'], 'three.jpg'));
    expect(screen.getByText('three.jpg')).toBeVisible();
    expect(screen.queryByText('Drag')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(screen.getByText('Draft saved')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.queryByText('three.jpg')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Submit snag list' }),
    ).toBeEnabled();
  });

  it('renders exact report totals and responsible-party values', () => {
    render(<SnagListsPage view="report" />);
    expect(screen.getByText('40 / 59')).toBeVisible();
    expect(screen.getByText('68%')).toBeVisible();
    expect(screen.getByText('Nasim Facility')).toBeVisible();
    expect(screen.getByText('11/18 · 61%')).toBeVisible();
    expect(screen.getByText('CoolWorks')).toBeVisible();
    expect(screen.getByText('12/12 · 100%')).toBeVisible();
  });

  it('keeps Arabic labels in RTL while preserving English fixture content and Latin digits', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    render(<SnagListsPage view="listing" />);
    expect(screen.getByRole('tab', { name: 'ملاحقات مفتوحة 3' })).toBeVisible();
    expect(screen.getByText('SNG-2026-041')).toBeVisible();
    expect(
      screen.getByText('Wonder Zone soft play refurbishment — handover snags'),
    ).toBeVisible();
    expect(document.documentElement.dir).toBe('rtl');
    cleanup();
    render(<SnagListsPage view="add" />);
    expect(screen.getByTestId('snag-add')).toBeVisible();
    cleanup();
    render(<SnagListsPage view="report" />);
    expect(screen.getByTestId('snag-report')).toBeVisible();
  });
});
