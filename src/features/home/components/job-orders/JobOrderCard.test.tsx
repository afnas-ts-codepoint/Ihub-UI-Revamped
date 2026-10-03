import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';

import { JOB_ORDERS } from '../../data/jobOrders.mock';
import type { QueueJobOrder } from '../../types/queue.types';
import { JobOrderCard } from './JobOrderCard';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  document.documentElement.dir = 'ltr';
  await i18n.changeLanguage('en');
});

const order = (id: string): QueueJobOrder => {
  const found = JOB_ORDERS.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};

function renderCard(item: QueueJobOrder, extra: Partial<ComponentProps<typeof JobOrderCard>> = {}) {
  const handlers = { onDismiss: vi.fn(), onOpenDrawer: vi.fn(), ...extra };
  render(<JobOrderCard item={item} {...handlers} />);
  return handlers;
}

describe('JobOrderCard', () => {
  it('shows the id, kind, assignment, title, place fields and priority/status chips', () => {
    renderCard(order('JO-7779'));
    const card = within(screen.getByTestId('job-order-card-JO-7779'));
    expect(card.getByText('JO-7779')).toBeVisible();
    expect(card.getByText('Internal')).toBeVisible();
    expect(card.getByText('Assigned to you')).toBeVisible();
    expect(card.getByText('Repair escalator B2')).toBeVisible();
    for (const text of ['Riyadh Park', 'Facilities', 'Due today', 'In-house MEP']) {
      expect(card.getByText(text)).toBeVisible();
    }
    expect(card.getByText('high')).toBeVisible();
    expect(card.getByText('Assigned')).toBeVisible();
  });

  it('shows the external kind', () => {
    renderCard(order('JO-7775'));
    expect(screen.getByText('External')).toBeVisible();
  });

  it('derives the progress bar from the status text', () => {
    renderCard(order('JO-7770'));
    expect(screen.getByRole('progressbar', { name: 'Progress' })).toHaveAttribute('aria-valuenow', '67');
    expect(screen.getByText('67%')).toBeVisible();
  });

  it.each([
    ['JO-7779', 'Due today'],
    ['JO-7782', 'Due tomorrow'],
  ])('marks a %s due text as urgent', (id, due) => {
    renderCard(order(id));
    expect(screen.getByText(due)).toHaveClass('text-bad');
  });

  it('does not mark a later due date as urgent', () => {
    renderCard(order('JO-7775'));
    expect(screen.getByText('Due in 5 days')).not.toHaveClass('text-bad');
  });

  it('shows the NEW badge with Assign and Dismiss for a new job order', async () => {
    const user = userEvent.setup();
    const { onDismiss, onOpenDrawer } = renderCard(order('JO-7782'));
    expect(screen.getByText('NEW')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Track/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Assign' }));
    expect(onOpenDrawer).toHaveBeenCalledWith(order('JO-7782'));
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledWith(order('JO-7782'));
  });

  it('shows Track for an assigned job order and no NEW badge', async () => {
    const user = userEvent.setup();
    const { onOpenDrawer } = renderCard(order('JO-7779'));
    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Assign' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Track/ }));
    expect(onOpenDrawer).toHaveBeenCalledWith(order('JO-7779'));
  });

  it('opens the drawer on a body click when the card has no open handler', async () => {
    const user = userEvent.setup();
    const { onOpenDrawer } = renderCard(order('JO-7779'));
    await user.click(screen.getByTestId('job-order-card-body'));
    expect(onOpenDrawer).toHaveBeenCalledWith(order('JO-7779'));
  });

  it('uses the open handler for a body click and keeps the buttons on the drawer', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const { onOpenDrawer } = renderCard(order('JO-7779'), { onOpen });
    await user.click(screen.getByTestId('job-order-card-body'));
    expect(onOpen).toHaveBeenCalledWith(order('JO-7779'));
    expect(onOpenDrawer).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /Track/ }));
    expect(onOpenDrawer).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('opens from the keyboard', async () => {
    const user = userEvent.setup();
    const { onOpenDrawer } = renderCard(order('JO-7779'));
    screen.getByTestId('job-order-card-body').focus();
    await user.keyboard('{Enter}');
    expect(onOpenDrawer).toHaveBeenCalledTimes(1);
  });

  it('localises the card chrome in Arabic and keeps the raw priority and status text', async () => {
    await i18n.changeLanguage('ar');
    renderCard(order('JO-7782'));
    const card = within(screen.getByTestId('job-order-card-JO-7782'));
    expect(card.getByText('جديد')).toBeVisible();
    expect(card.getByText('داخلي')).toBeVisible();
    expect(card.getByText('مُسندة إليك')).toBeVisible();
    expect(card.getByText('التقدم')).toBeVisible();
    expect(card.getByRole('button', { name: 'تعيين' })).toBeVisible();
    expect(card.getByText('high')).toBeVisible();
    expect(card.getByText('New')).toBeVisible();
  });
});
