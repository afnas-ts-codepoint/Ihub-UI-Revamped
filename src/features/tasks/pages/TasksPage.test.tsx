import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { TasksPage } from './TasksPage';
import { useTasksStore } from '../store/tasks.store';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  useTasksStore.getState().reset();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

describe('M8.1 Tasks page', () => {
  it('defaults to List with the exact fixtures and column order', async () => {
    render(<TasksPage />);
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getAllByRole('row')).toHaveLength(7);
    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual([
      'Task',
      'Subject',
      'Location/Zone',
      'Department',
      'Due',
      'SLA Status',
      'Progress',
      'Action',
    ]);
    expect(screen.getByText('Emergency HVAC failure — 360 Mall')).toBeVisible();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Page 2' }));
    expect(screen.getByText('Restroom deep clean — East concourse')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Card' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeVisible();
    expect(screen.getByText('Group:')).toBeVisible();
    expect(screen.queryByText(/QA/i)).not.toBeInTheDocument();
  });

  it('keeps Create a New Task inert within M8.1', async () => {
    const user = userEvent.setup();
    render(<TasksPage />);
    await user.click(screen.getByRole('button', { name: 'Create a New Task' }));
    expect(screen.getByTestId('tasks-page')).toBeVisible();
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('filters the shared fixtures by Internal and External without counts', async () => {
    const user = userEvent.setup();
    render(<TasksPage />);
    await user.click(screen.getByRole('button', { name: 'Internal' }));
    expect(screen.getAllByRole('row')).toHaveLength(7);
    expect(screen.queryByText('T-002')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'External' }));
    expect(screen.getAllByRole('row')).toHaveLength(5);
    expect(screen.getByText('T-002')).toBeVisible();
    expect(screen.queryByText('T-001')).not.toBeInTheDocument();
  });

  it('renders the exact Board columns and initial placement', async () => {
    const user = userEvent.setup();
    render(<TasksPage />);
    await user.click(screen.getByRole('button', { name: 'Board' }));
    const board = screen.getByTestId('task-board');
    const expected = {
      new: ['T-002', 'T-007'],
      progress: ['T-003', 'T-005', 'T-008', 'T-009'],
      critical: ['T-001', 'T-004'],
      completed: ['T-006', 'T-010'],
    } as const;
    for (const [column, ids] of Object.entries(expected)) {
      const container = board.querySelector(`[data-board-column="${column}"]`);
      if (!(container instanceof HTMLElement))
        throw new Error(`Missing board column: ${column}`);
      for (const id of ids)
        expect(within(container).getByText(id)).toBeVisible();
    }
    expect(screen.getAllByRole('button', { name: 'Add card' })).toHaveLength(4);
  });

  it('keeps Dashboard analytics pending and its Go to tasks control inert', async () => {
    const user = userEvent.setup();
    render(<TasksPage />);
    await user.click(screen.getByRole('button', { name: 'Dashboard' }));
    expect(screen.getByRole('status')).toHaveAttribute(
      'data-migration-pending',
      'Task dashboard analytics',
    );
    await user.click(screen.getByRole('button', { name: 'Go to tasks →' }));
    expect(screen.getByRole('status')).toBeVisible();
  });

  it('opens the detail modal from a row and Delete Task only closes it', async () => {
    const user = userEvent.setup();
    render(<TasksPage />);
    await user.click(screen.getByRole('row', { name: 'Open T-001' }));
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(
      within(screen.getByRole('dialog')).getAllByRole('heading', {
        name: 'Emergency HVAC failure — 360 Mall',
      }),
    ).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Delete Task' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('T-001')).toBeVisible();
  });

  it('synchronizes progress and Close/Reopen state across List and Board', async () => {
    const user = userEvent.setup();
    render(<TasksPage />);
    const row = screen.getByRole('row', { name: 'Open T-002' });
    await user.click(within(row).getByRole('button', { name: 'Close' }));
    expect(within(row).getByText('100%')).toBeVisible();
    expect(within(row).getByRole('button', { name: 'Reopen' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Board' }));
    const completed = screen
      .getByTestId('task-board')
      .querySelector('[data-board-column="completed"]');
    if (!(completed instanceof HTMLElement))
      throw new Error('Missing Completed board column');
    expect(within(completed).getByText('T-002')).toBeVisible();
  });

  it('opens the same modal from a Board card and keeps Add card inert', async () => {
    const user = userEvent.setup();
    render(<TasksPage />);
    await user.click(screen.getByRole('button', { name: 'Board' }));
    await user.click(screen.getByRole('button', { name: 'Open T-007' }));
    expect(screen.getByRole('dialog')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const [addCard] = screen.getAllByRole('button', { name: 'Add card' });
    if (!addCard) throw new Error('Missing Add card control');
    await user.click(addCard);
    expect(screen.getByTestId('task-board')).toBeVisible();
  });

  it('localizes controls in Arabic RTL while retaining English fixture and columns', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    render(<TasksPage />);
    expect(screen.getByRole('button', { name: 'القائمة' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'داخلية' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Subject' })).toBeVisible();
    expect(screen.getByText('Emergency HVAC failure — 360 Mall')).toBeVisible();
  });
});
