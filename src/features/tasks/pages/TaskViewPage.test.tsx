import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { TaskViewPage } from './TaskViewPage';
import { useTasksStore } from '../store/tasks.store';
import type { Task } from '../types/task.types';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { Toaster } from '@/shared/ui/feedback/Toaster';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  useTasksStore.getState().reset();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

/** Reachable by direct URL/link only (per M8.4 scope), so a single memory-router entry is realistic. */
function renderRoute(path: string) {
  const router = createMemoryRouter(
    [
      { element: <TaskViewPage />, path: '/tasks/:taskId' },
      {
        element: <div data-testid="edit-route">{'edit-route'}</div>,
        path: '/tasks/:taskId/edit',
      },
      {
        element: <div data-testid="work-centre-tasks">{'work-centre-tasks'}</div>,
        path: '/home/work-centre/tasks',
      },
    ],
    { initialEntries: [path] },
  );
  render(
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>,
  );
  return router;
}

/** The dependency reminder opens immediately (0ms) in read-only Task View and, being a
 * modal dialog, marks the rest of the page inert/aria-hidden — dismiss it first for tests
 * that assert on the underlying page via role queries. */
async function dismissReminder(user: ReturnType<typeof userEvent.setup>) {
  const dialog = screen.queryByRole('dialog');
  if (!dialog) return;
  const closeButtons = within(dialog).getAllByRole('button', { name: /Close|إغلاق/ });
  await user.click(closeButtons[closeButtons.length - 1] as HTMLElement);
}

const createdTask: Task = {
  days: 0,
  department: 'Operations',
  dependencies: 0,
  due: '15 Mar',
  flow: 'direct',
  id: 'TASK-999999',
  kind: 'internal',
  location: '360 Mall',
  risk: 'Medium',
  severity: 'Medium',
  sla: '',
  stage: 'Open',
  subject: 'Created via M8.3 for M8.4 lookup',
  zone: 'North Wing',
};

describe('M8.4 Task View page', () => {
  it('renders the seeded task with header, all panels and no visible task-id heading', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001');
    await dismissReminder(user);
    expect(screen.getByTestId('task-view-page')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'View Task' })).toBeVisible();
    expect(screen.getByTestId('task-view-header')).toHaveTextContent(
      'Emergency HVAC failure — 360 Mall',
    );
    expect(screen.queryByText('T-001')).not.toBeInTheDocument();

    for (const title of [
      'Sub Tasks Progress',
      'Task Details',
      'Task Classification',
      'Requester Info',
      'Location & Zone',
      'Activity History',
      'Assignment Info',
      'Dependencies',
      'Reference Numbers',
      'Log Notes',
      'SLA & Performance',
      'Attachments',
    ]) {
      expect(screen.getByRole('heading', { name: title })).toBeVisible();
    }
  });

  it('looks up an M8.3-created task through the shared store', async () => {
    const user = userEvent.setup();
    useTasksStore.getState().prependTask(createdTask);
    renderRoute(`/tasks/${createdTask.id}`);
    await dismissReminder(user);
    expect(screen.getByTestId('task-view-header')).toHaveTextContent(
      'Created via M8.3 for M8.4 lookup',
    );
  });

  it('shows a not-found state for an unknown task id and falls back to the work-centre tasks route', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/UNKNOWN-ID');
    expect(screen.getByTestId('task-view-not-found')).toBeVisible();
    expect(screen.getByText('Task not found')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Back to tasks' }));
    expect(await screen.findByTestId('work-centre-tasks')).toBeVisible();
  });

  it('renders no edit-mode-only controls (read-only fidelity)', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001');
    await dismissReminder(user);
    for (const name of [
      'CEO Comments',
      'Submit',
      'Approve',
      'Reject',
      'Close Task',
      'Add Dependency',
      'Update Sub Tasks',
      'Post Comment',
    ]) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    }
    expect(screen.queryByTestId('attachment-drop-zone')).not.toBeInTheDocument();
  });

  it('navigates to the pending edit route when Edit Task is clicked', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001');
    await dismissReminder(user);
    await user.click(screen.getByRole('button', { name: 'Edit Task' }));
    expect(await screen.findByTestId('edit-route')).toBeVisible();
  });

  it('opens a metadata-only preview for the seeded attachment and shows a download toast', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001');
    await dismissReminder(user);
    // Attachments starts collapsed (only Sub Tasks/Assignment/SLA default open, matching the
    // prototype's tepOpenCards) — expand it first.
    await user.click(screen.getByRole('button', { name: 'Attachments' }));
    await user.click(screen.getByRole('button', { name: 'View Screenshot (7).png' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Screenshot (7).png')).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Download' }));
    expect(await screen.findByText('Downloading…')).toBeVisible();
  });

  it('opens the Sub Task History dialog from a subtask row, with Timeline and Gantt tabs', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001');
    await dismissReminder(user);
    await user.click(screen.getByRole('button', { name: /Identify Safety Issue/ }));
    expect(screen.getByRole('heading', { name: 'Sub Task History' })).toBeVisible();
    expect(screen.getByText('Initial Assessment')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Gantt Chart' }));
    expect(await screen.findByTestId('gantt-chart')).toBeVisible();
    expect(screen.getByText('Total Tasks')).toBeVisible();
  });

  it('fires the dependency reminder immediately with the due-soon fixture, and "View dependencies" opens the panel', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001');
    expect(screen.getByRole('heading', { name: 'Dependency Reminder' })).toBeVisible();
    expect(screen.getByText('DEP-001')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'View dependencies' }));
    expect(screen.queryByRole('heading', { name: 'Dependency Reminder' })).not.toBeInTheDocument();
    expect(screen.getByText('DEP-001')).toBeVisible();
  });

  it('renders Arabic in RTL with the ported panel titles', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    const user = userEvent.setup();
    renderRoute('/tasks/T-001');
    await dismissReminder(user);
    expect(screen.getByRole('heading', { name: 'عرض المهمة' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'تقدم المهام الفرعية' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'تعديل المهمة' })).toBeVisible();
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('collapses to a single column below the desktop breakpoint (Tailwind responsive class)', () => {
    renderRoute('/tasks/T-001');
    expect(screen.getByTestId('task-view-columns')).toHaveClass(
      'grid-cols-1',
      'desktop:grid-cols-[minmax(0,29fr)_minmax(0,11fr)]',
    );
  });
});
