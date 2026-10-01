import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';

import { ACTIONS } from '../../data/actions.mock';
import type { QueueAction } from '../../types/queue.types';
import { ActionCard, type ActionCardProps } from './ActionCard';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

const action = (id: string): QueueAction => {
  const found = ACTIONS.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing fixture ${id}`);
  return found;
};

function renderCard(id: string, props: Partial<ActionCardProps> = {}) {
  const handlers = {
    onAct: vi.fn(),
    onOpen: vi.fn(),
    onToggle: vi.fn(),
  };
  render(
    <ActionCard item={action(id)} selected={false} {...handlers} {...props} />,
  );
  return handlers;
}

describe('ActionCard', () => {
  it('renders every field of an overdue critical action (A1)', () => {
    renderCard('A1');
    const card = screen.getByTestId('action-card-A1');
    expect(within(card).getByText('BUD-2026-107')).toBeVisible();
    expect(
      within(card).getByText('Budget Release — Eid Activation, 360 Mall'),
    ).toBeVisible();
    // Raw lowercase English data, untranslated.
    expect(within(card).getByText('critical')).toBeVisible();
    expect(within(card).getByText('Overdue 2 days')).toBeVisible();
    expect(within(card).getByText('Sara Al-Qahtani')).toBeVisible();
    expect(within(card).getByText('Marketing')).toBeVisible();
    expect(within(card).getByText('Awaiting your release')).toBeVisible();
    expect(within(card).getByText('Release funds')).toBeVisible();
    expect(within(card).getByText(/Recommended:/)).toBeVisible();
    expect(within(card).getByText('KWD 42,000')).toBeVisible();
    expect(card.className).toContain('--bad');
  });

  it('does not tint the border of a card that is not overdue', () => {
    renderCard('A2');
    expect(screen.getByTestId('action-card-A2').className).not.toContain(
      '--bad',
    );
  });

  it('shows the SLA badge only when the clock needs attention', () => {
    render(
      <>
        <ActionCard
          item={action('A1')}
          onAct={vi.fn()}
          onOpen={vi.fn()}
          onToggle={vi.fn()}
          selected={false}
        />
        <ActionCard
          item={action('A3')}
          onAct={vi.fn()}
          onOpen={vi.fn()}
          onToggle={vi.fn()}
          selected={false}
        />
        <ActionCard
          item={action('A4')}
          onAct={vi.fn()}
          onOpen={vi.fn()}
          onToggle={vi.fn()}
          selected={false}
        />
      </>,
    );
    const a1 = within(screen.getByTestId('action-card-A1'));
    const a3 = within(screen.getByTestId('action-card-A3'));
    const a4 = within(screen.getByTestId('action-card-A4'));
    expect(a1.getByText('Over by 5.3h')).toHaveAttribute(
      'title',
      'Target 1d · waiting 1d 5h',
    );
    expect(a3.getByText('12m left')).toBeVisible();
    expect(a4.queryByText(/left$/)).toBeNull();
    expect(a4.queryByText(/Over by/)).toBeNull();
  });

  it('opens the item from the body and from the Edit button identically', async () => {
    const user = userEvent.setup();
    const { onOpen, onAct } = renderCard('A2');
    await user.click(screen.getByTestId('action-card-body'));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(onOpen).toHaveBeenNthCalledWith(1, action('A2'));
    expect(onOpen).toHaveBeenNthCalledWith(2, action('A2'));
    expect(onAct).not.toHaveBeenCalled();
  });

  it('opens from the keyboard on the body', async () => {
    const user = userEvent.setup();
    const { onOpen } = renderCard('A2');
    screen.getByTestId('action-card-body').focus();
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledWith(action('A2'));
  });

  it.each([
    ['Approve', 'approve'],
    ['Send back', 'sendback'],
    ['Reject', 'reject'],
    ['Pin to top', 'pin'],
  ] as const)('the %s button emits %s', async (name, verb) => {
    const user = userEvent.setup();
    const { onAct, onOpen } = renderCard('A5');
    await user.click(screen.getByRole('button', { name }));
    expect(onAct).toHaveBeenCalledExactlyOnceWith(verb, action('A5'));
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('titles the rail buttons for hover as well as for assistive tech', () => {
    renderCard('A5');
    for (const name of ['Approve', 'Edit', 'Send back', 'Reject', 'Pin to top'])
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'title',
        name,
      );
  });

  it('marks Pin active only for a pinned item', () => {
    cleanup();
    renderCard('A5', { item: { ...action('A5'), pinned: true } });
    const pin = screen.getByRole('button', { name: 'Pin to top' });
    expect(pin).toHaveAttribute('aria-pressed', 'true');
    expect(pin.className).toContain('text-accent');
    cleanup();
    renderCard('A5');
    expect(
      screen.getByRole('button', { name: 'Pin to top' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('labels the primary action Verify in verify mode', () => {
    renderCard('A5', { verify: true });
    expect(screen.getByRole('button', { name: 'Verify' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
  });

  it('gates the checkbox on `selectable` and toggles without opening the item', async () => {
    const user = userEvent.setup();
    const { onToggle, onOpen } = renderCard('A5', { selected: true });
    const checkbox = screen.getByRole('checkbox', {
      name: 'Budget Approval — Q3 Capex, Arcade Refresh',
    });
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(onToggle).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
    cleanup();
    renderCard('A5', { selectable: false });
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('renders Arabic labels for the rail, keeping the English Pin tooltip and raw data', async () => {
    await i18n.changeLanguage('ar');
    renderCard('A1');
    expect(screen.getByRole('button', { name: 'موافقة' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'تعديل' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'إعادة' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'رفض' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Pin to top' })).toBeVisible();
    expect(screen.getByText(/موصى به:/)).toBeVisible();
    expect(screen.getByText('critical')).toBeVisible();
    expect(screen.getByText('متجاوز بـ 5.3س')).toBeVisible();
  });
});
