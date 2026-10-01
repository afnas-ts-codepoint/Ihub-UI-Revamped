import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';

import { ACTIONS } from '../../data/actions.mock';
import { ActionList, type ActionListProps } from './ActionList';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

const VISIBLE = ACTIONS.slice(0, 3);

function renderList(props: Partial<ActionListProps> = {}) {
  const handlers = {
    onAct: vi.fn(),
    onBatch: vi.fn(),
    onOpen: vi.fn(),
    onToggle: vi.fn(),
  };
  render(
    <ActionList items={VISIBLE} selectedIds={[]} {...handlers} {...props} />,
  );
  return handlers;
}

describe('ActionList', () => {
  it('renders one card per item with a checkbox each and no batch bar by default', () => {
    renderList();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    expect(screen.queryByTestId('batch-bar')).toBeNull();
  });

  it('shows the batch bar once an item in view is selected', async () => {
    const user = userEvent.setup();
    const { onBatch } = renderList({ selectedIds: ['A1', 'A2'] });
    const bar = screen.getByTestId('batch-bar');
    expect(bar).toHaveTextContent('2 selected');
    expect(bar).toHaveTextContent('Batch decision');
    await user.click(screen.getByRole('button', { name: 'Approve 2' }));
    await user.click(screen.getByRole('button', { name: 'Reject all' }));
    expect(onBatch).toHaveBeenNthCalledWith(1, 'approve');
    expect(onBatch).toHaveBeenNthCalledWith(2, 'reject');
  });

  it('counts only the selected items that are visible', () => {
    renderList({ selectedIds: ['A1', 'A9', 'A10'] });
    expect(screen.getByTestId('batch-bar')).toHaveTextContent('1 selected');
    expect(screen.getByRole('button', { name: 'Approve 1' })).toBeVisible();
  });

  it('hides the bar when the whole selection is filtered out of view', () => {
    renderList({ selectedIds: ['A9'] });
    expect(screen.queryByTestId('batch-bar')).toBeNull();
  });

  it('labels the batch approve button Verify in verify mode', () => {
    renderList({ selectedIds: ['A1'], verify: true });
    expect(screen.getByRole('button', { name: 'Verify 1' })).toBeVisible();
  });

  it('showBatch=false hides the checkboxes and the bar even with a selection', () => {
    renderList({ selectedIds: ['A1'], showBatch: false });
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.queryByTestId('batch-bar')).toBeNull();
    expect(screen.getAllByTestId(/^action-card-A/)).toHaveLength(3);
  });

  it('wires toggle, act and open to the clicked card', async () => {
    const user = userEvent.setup();
    const { onAct, onOpen, onToggle } = renderList();
    await user.click(
      screen.getAllByRole('checkbox')[1] as HTMLElement,
    );
    expect(onToggle).toHaveBeenCalledExactlyOnceWith('A2');
    await user.click(screen.getAllByRole('button', { name: 'Reject' })[2] as HTMLElement);
    expect(onAct).toHaveBeenCalledExactlyOnceWith('reject', VISIBLE[2]);
    await user.click(screen.getAllByTestId('action-card-body')[0] as HTMLElement);
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(VISIBLE[0]);
  });

  it('shows the empty state when there are no items', () => {
    renderList({ items: [] });
    expect(screen.getByText('Nothing here')).toBeVisible();
    expect(screen.getByText('No items match this filter.')).toBeVisible();
  });

  it('renders the Arabic batch bar and empty state', async () => {
    await i18n.changeLanguage('ar');
    renderList({ selectedIds: ['A1', 'A2'] });
    const bar = screen.getByTestId('batch-bar');
    expect(bar).toHaveTextContent('2 محدد');
    expect(bar).toHaveTextContent('قرار جماعي');
    expect(screen.getByRole('button', { name: 'موافقة 2' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'رفض الكل' })).toBeVisible();
    cleanup();
    renderList({ items: [] });
    expect(screen.getByText('لا شيء هنا')).toBeVisible();
    expect(screen.getByText('لا عناصر مطابقة.')).toBeVisible();
  });
});
