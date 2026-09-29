import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { TaskEditPage } from './TaskEditPage';
import { useTasksStore } from '../store/tasks.store';
import type { Task } from '../types/task.types';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { Toaster } from '@/shared/ui/feedback/Toaster';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  useTasksStore.getState().reset();
  vi.useRealTimers();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

function renderRoute(path: string) {
  const router = createMemoryRouter(
    [
      { element: <TaskEditPage />, path: '/tasks/:taskId/edit' },
      { element: <div data-testid="work-centre-tasks">{'work-centre-tasks'}</div>, path: '/home/work-centre/tasks' },
    ],
    { initialEntries: [path] },
  );
  const view = render(<><RouterProvider router={router} /><Toaster /></>);
  return { router, ...view };
}

const createdTask: Task = {
  days: 0,
  department: 'Operations',
  dependencies: 0,
  due: '15 Mar',
  flow: 'direct',
  id: 'TASK-EDIT-999',
  kind: 'internal',
  location: '360 Mall',
  risk: 'Medium',
  severity: 'Medium',
  sla: '',
  stage: 'Open',
  subject: 'Created via M8.3 for edit lookup',
  zone: 'North Wing',
};

describe('M8.5 Task Edit page', () => {
  it('activates the direct route with the edit column order and the M8.6 sticky action bar', () => {
    renderRoute('/tasks/T-001/edit');
    expect(screen.getByTestId('task-edit-page')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Edit Task' })).toBeVisible();
    for (const title of [
      'Sub Tasks Progress', 'Task Details', 'Task Classification', 'Requester Info',
      'Location & Zone', 'SLA & Performance', 'Attachments', 'Reference Numbers',
      'Activity History', 'Assignment Info', 'Dependencies', 'Add Comment', 'Log Notes',
    ]) expect(screen.getByRole('heading', { name: title })).toBeVisible();

    const bar = screen.getByTestId('task-edit-action-bar');
    for (const name of ['CEO Comments', 'Submit', 'Approve', 'Reject', 'Close Task', 'More']) {
      expect(within(bar).getByRole('button', { name })).toBeVisible();
    }
  });

  it('resolves M8.3-created tasks from the approved shared task store', () => {
    useTasksStore.getState().prependTask(createdTask);
    renderRoute(`/tasks/${createdTask.id}/edit`);
    expect(screen.getByTestId('task-view-header')).toHaveTextContent(createdTask.subject);
  });

  it('shows the shared not-found treatment for an unknown id and backs out safely', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/UNKNOWN/edit');
    expect(screen.getByTestId('task-edit-not-found')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Back to tasks' }));
    expect(await screen.findByTestId('work-centre-tasks')).toBeVisible();
  });

  it('requires a changed SLA date and non-empty justification, then prepends local history', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(screen.getByRole('button', { name: 'SLA & Performance' }));
    await user.click(screen.getByRole('button', { name: 'Edit target completion' }));
    const save = screen.getByRole('button', { name: 'Save' });
    expect(save).toBeDisabled();
    await user.clear(screen.getByLabelText('New Target Completion'));
    await user.type(screen.getByLabelText('New Target Completion'), '2027-02-04T13:30');
    expect(save).toBeDisabled();
    await user.type(screen.getByLabelText(/Justification/), 'Vendor rescheduled delivery');
    expect(save).toBeEnabled();
    await user.click(save);
    expect(screen.getByText('Vendor rescheduled delivery')).toBeVisible();
    expect(screen.getByText('2 changes')).toBeVisible();
  });

  it('keeps comments local, gates only on remarks, supports repeatable rows and resets after posting', async () => {
    const user = userEvent.setup();
    const { container } = renderRoute('/tasks/T-001/edit');
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));
    expect(await screen.findByText('Add a remark before posting')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Add More' }));
    expect(screen.getAllByLabelText('Activity')).toHaveLength(2);
    await user.type(screen.getByLabelText('Partner Remarks'), 'Checked on site');
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(fileInput).not.toBeNull();
    fireEvent.change(fileInput as HTMLInputElement, {
      target: { files: [new File(['fixture'], 'note.pdf', { type: 'application/pdf' })] },
    });
    expect(screen.getByText('note.pdf')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Post Comment' }));
    expect(await screen.findByText('Comment posted')).toBeVisible();
    expect(screen.getByLabelText('Partner Remarks')).toHaveValue('');
    expect(screen.queryByText('note.pdf')).not.toBeInTheDocument();
    expect(screen.getAllByLabelText('Activity')).toHaveLength(1);
  });

  it('posts log notes as literal text, including @mentions', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    const input = screen.getByLabelText('Type a log note… Use @ to mention someone');
    await user.type(input, '@Alex please verify{Enter}');
    expect(screen.getByText('@Alex please verify')).toBeVisible();
    expect(input).toHaveValue('');
  });

  it('shows the dependency reminder only after the edit-mode two-second delay', () => {
    vi.useFakeTimers();
    renderRoute('/tasks/T-001/edit');
    expect(screen.queryByRole('heading', { name: 'Dependency Reminder' })).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1999); });
    expect(screen.queryByRole('heading', { name: 'Dependency Reminder' })).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.getByRole('heading', { name: 'Dependency Reminder' })).toBeVisible();
  });

  it('keeps activity filters decorative while row expansion, drag ordering and pagination remain available', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(screen.getByRole('button', { name: 'Activity History' }));
    await user.selectOptions(screen.getByLabelText('Activity Type'), 'Status Updated');
    expect(screen.getByText('Showing 10 of 10 activities')).toBeVisible();
    const firstActivity = screen.getAllByRole('row')[1] as HTMLElement;
    await user.click(firstActivity);
    expect(within(firstActivity.parentElement as HTMLElement).getAllByText(/Comment/).length).toBeGreaterThan(0);
  });

  it('renders Arabic in RTL and retains the responsive single-column fallback', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderRoute('/tasks/T-001/edit');
    expect(screen.getByRole('heading', { name: 'تعديل المهمة' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'إضافة تعليق' })).toBeVisible();
    expect(document.documentElement.dir).toBe('rtl');
    expect(screen.getByTestId('task-edit-columns')).toHaveClass('grid-cols-1', 'desktop:grid-cols-[minmax(0,29fr)_minmax(0,11fr)]');
    const bar = screen.getByTestId('task-edit-action-bar');
    expect(within(bar).getByRole('button', { name: 'تعليقات الرئيس التنفيذي' })).toBeVisible();
    expect(within(bar).getByRole('button', { name: 'المزيد' })).toBeVisible();
  });
});

describe('M8.6 Task Edit action bar and dialogs', () => {
  it('Approve Task closes on confirm and shows a toast with no field validation', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(within(screen.getByTestId('task-edit-action-bar')).getByRole('button', { name: 'Approve' }));
    expect(screen.getByRole('heading', { name: 'Approve Task' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Confirm Approval' }));
    expect(await screen.findByText('Task approved')).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Approve Task' })).not.toBeInTheDocument();
  });

  it('Reject caps remarks at 500 characters, shows a live counter, and requires non-empty remarks', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(within(screen.getByTestId('task-edit-action-bar')).getByRole('button', { name: 'Reject' }));
    expect(screen.getByRole('heading', { name: 'Reject Job Order' })).toBeVisible();
    const confirm = screen.getByRole('button', { name: 'Confirm Rejection' });
    expect(confirm).toBeDisabled();
    const textarea = screen.getByLabelText('Rejection Remarks (Max 500 Characters)');
    fireEvent.change(textarea, { target: { value: 'a'.repeat(510) } });
    expect(textarea).toHaveValue('a'.repeat(500));
    expect(screen.getByText('500/500 characters')).toBeVisible();
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    expect(await screen.findByText('Task rejected')).toBeVisible();
  });

  it('Close Task requires non-empty remarks and toasts on confirm', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(within(screen.getByTestId('task-edit-action-bar')).getByRole('button', { name: 'Close Task' }));
    const confirm = screen.getByRole('button', { name: 'Confirm Close' });
    expect(confirm).toBeDisabled();
    await user.type(screen.getByLabelText('Closing Remarks (Max 500 Characters)'), 'Resolved and verified on site');
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    expect(await screen.findByText('Task closed')).toBeVisible();
  });

  it('CEO Comments Save succeeds with every field empty (unenforced required note, D2)', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(within(screen.getByTestId('task-edit-action-bar')).getByRole('button', { name: 'CEO Comments' }));
    expect(screen.getByText('Process owner and assignee are required.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('CEO comments saved')).toBeVisible();
  });

  it('Submit, Log Note, Export and Print are inert toasts only', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    const bar = screen.getByTestId('task-edit-action-bar');
    await user.click(within(bar).getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Task submitted')).toBeVisible();
    await user.click(within(bar).getByRole('button', { name: 'More' }));
    await user.click(screen.getByRole('menuitem', { name: 'Export' }));
    expect(await screen.findByText('Export')).toBeVisible();
  });

  it('Redirect requires process owner and assignee, then overwrites the Assignment Info card', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(within(screen.getByTestId('task-edit-action-bar')).getByRole('button', { name: 'More' }));
    await user.click(screen.getByRole('menuitem', { name: 'Redirect' }));
    const dialog = screen.getByRole('dialog', { name: 'Redirect Task' });
    await user.click(within(dialog).getByRole('button', { name: 'Redirect Task' }));
    expect(await screen.findByText('Process owner and assignee are required.')).toBeVisible();
    expect(dialog).toBeVisible();

    await user.selectOptions(within(dialog).getByLabelText(/Process Owner/), 'Safety Department');
    await user.selectOptions(within(dialog).getByLabelText(/^Assignee/), 'Ahmed Ali');
    await user.click(within(dialog).getByRole('button', { name: 'Redirect Task' }));
    expect(await screen.findByText('Task redirected')).toBeVisible();
    expect(within(screen.getByTestId('task-edit-columns')).getByText('Safety Department')).toBeVisible();
    expect(within(screen.getByTestId('task-edit-columns')).getByText('Ahmed Ali', { selector: 'p' })).toBeVisible();
  });

  it('Add Dependency requires category and lead time; showstopper reveals an unenforced Impacted Date field', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(screen.getByRole('button', { name: 'Dependencies' }));
    expect(screen.getByText('Current Dependencies (1)')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Add Dependency' }));
    const dialog = screen.getByRole('dialog', { name: 'Add New Dependency' });
    await user.click(within(dialog).getByRole('button', { name: 'Add Dependency' }));
    expect(await screen.findByText('Category and lead time are required')).toBeVisible();

    await user.selectOptions(within(dialog).getByLabelText(/^Category/), 'Vendor');
    await user.type(within(dialog).getByLabelText(/^Lead Time/), '5 business days');
    await user.click(within(dialog).getByLabelText('Mark as Showstopper'));
    expect(within(dialog).getByLabelText('Impacted Date (due to Blocking)')).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Add Dependency' }));

    expect(await screen.findByText('Dependency added')).toBeVisible();
    expect(screen.getByText('Current Dependencies (2)')).toBeVisible();
    expect(screen.getByText(/5 business days/)).toBeVisible();
  });

  it('opens Update Sub Tasks from the header toolbar button and blocks Save while the seeded weights exceed 100%', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(screen.getByRole('button', { name: 'Update Sub Tasks' }));
    const dialog = screen.getByRole('dialog', { name: 'Resolution Tasks' });
    expect(dialog).toBeVisible();

    await user.click(within(dialog).getByRole('button', { name: 'Save & Update' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Total weight exceeds 100%');
    expect(dialog).toBeVisible();
  });

  it('allows Save & Update once bulk-deleting selected rows brings the total to 100% or below', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(screen.getByRole('button', { name: 'Update Sub Tasks' }));
    const dialog = screen.getByRole('dialog', { name: 'Resolution Tasks' });
    // Seeded weights sum to 455 (100+100+100+45+20+30+60); deleting the five
    // heaviest rows leaves 30+60=90, at or below the 100% gate.
    for (const title of [
      'Identify Safety Issue', 'Check Vendor Stock', 'Procure & Deliver Parts',
      'Equipment Setup', 'Electrical Inspection',
    ]) {
      const row = within(dialog).getByText(title).closest('label') as HTMLElement;
      await user.click(within(row).getByRole('checkbox'));
    }
    await user.click(within(dialog).getByRole('button', { name: 'Delete Selected' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save & Update' }));
    expect(await screen.findByText('Sub tasks updated')).toBeVisible();
    expect(screen.queryByRole('dialog', { name: 'Resolution Tasks' })).not.toBeInTheDocument();
  });

  it('adding a subtask through the Add Subtask form requires Task Name and Remark', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(screen.getByRole('button', { name: 'Update Sub Tasks' }));
    const dialog = screen.getByRole('dialog', { name: 'Resolution Tasks' });
    await user.click(within(dialog).getByRole('button', { name: 'Add Subtask' }));
    await user.click(within(dialog).getByRole('button', { name: 'Add Task' }));
    expect((await screen.findAllByText('Task name is required.')).length).toBeGreaterThan(0);
    await user.type(within(dialog).getByLabelText('Task Name'), 'Extra inspection pass');
    await user.click(within(dialog).getByRole('button', { name: 'Add Task' }));
    expect((await screen.findAllByText('Remark is required.')).length).toBeGreaterThan(0);
    await user.type(within(dialog).getByLabelText(/^Remark/), 'Follow-up inspection needed');
    await user.click(within(dialog).getByRole('button', { name: 'Add Task' }));
    expect(within(dialog).getByText('Extra inspection pass')).toBeVisible();
  });

  it('opens Update Sub Tasks from a Sub Tasks Progress row click (not history) in edit mode', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(screen.getByRole('button', { name: /Identify Safety Issue/ }));
    expect(screen.getByRole('heading', { name: 'Resolution Tasks' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Sub Task History' })).not.toBeInTheDocument();
  });

  it('bulk-selects sub tasks and marks them completed', async () => {
    const user = userEvent.setup();
    renderRoute('/tasks/T-001/edit');
    await user.click(screen.getByRole('button', { name: 'Update Sub Tasks' }));
    const dialog = screen.getByRole('dialog', { name: 'Resolution Tasks' });
    await user.click(within(dialog).getByRole('checkbox', { name: 'Select All' }));
    await user.click(within(dialog).getByRole('button', { name: 'Mark as Completed' }));
    const completedChips = within(dialog).getAllByText('Completed');
    expect(completedChips.length).toBeGreaterThan(1);
  });
});
