import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { TaskFormDialog } from './TaskFormDialog';
import { CreateTaskPage } from '../pages/CreateTaskPage';
import { useTasksStore } from '../store/tasks.store';
import type { TaskFormPrefill } from './CreateTaskForm';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  useTasksStore.getState().reset();
  vi.restoreAllMocks();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

const prefill: TaskFormPrefill = {
  area: 'Front of house',
  carriedAttachments: ['Switch_log.pdf', 'Queue_photo.jpg'],
  details: 'All POS terminals lost connection.\n\nAction already taken: Manual receipts issued',
  location: '360 Mall',
  priority: 'critical',
  scope: 'internal',
  severity: 'high',
  subArea: 'Main cashier bank — tills 1–6',
  subject: 'Follow-up: POS network outage — 360 Mall',
  zone: 'Zone B',
};

function renderDialog(overrides: Partial<{ onCancel: () => void; onConfirm: () => void }> = {}) {
  const onCancel = overrides.onCancel ?? vi.fn();
  const onConfirm = overrides.onConfirm ?? vi.fn();
  render(<TaskFormDialog mode="createFromIncident" onCancel={onCancel} onConfirm={onConfirm} prefill={prefill} presentation="modal" sourceId="INC-2041" />);
  return { onCancel, onConfirm };
}

describe('M9.2 TaskFormDialog', () => {
  it('opens as a modal with the bespoke header and footer chrome', () => {
    renderDialog();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Raise a task' })).toBeVisible();
    expect(within(dialog).getByText('from incident')).toBeVisible();
    expect(within(dialog).getByText('INC-2041')).toBeVisible();
    expect(within(dialog).getByText('The incident stays open and links to the new task.')).toBeVisible();
    expect(dialog).toHaveAttribute('data-mode', 'createFromIncident');
    expect(dialog).toHaveAttribute('data-presentation', 'modal');
  });

  it('reuses the canonical create form without its own action bar', () => {
    renderDialog();
    for (const heading of ['Task Details', 'Attachments', 'Location and Zone', 'Asset / Machine Information', 'Reference Numbers']) {
      expect(screen.getByRole('heading', { name: heading })).toBeVisible();
    }
    for (const name of ['Task subject', 'Project Name', 'Details', 'Asset Code', 'Process Owner', 'Incident #']) {
      expect(screen.getByLabelText(name)).toBeVisible();
    }
    // Only the dialog footer submits: the form's own Create/Cancel bar and "Task created" flash are absent.
    expect(screen.getAllByRole('button', { name: 'Create task' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Cancel' })).toHaveLength(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByTestId('task-form-body')).toBeVisible();
    expect(screen.queryByTestId('create-task-page')).not.toBeInTheDocument();
  });

  it('seeds the canonical form from the prefill', () => {
    renderDialog();
    expect(screen.getByLabelText('Task subject')).toHaveValue('Follow-up: POS network outage — 360 Mall');
    expect(screen.getByLabelText('Details')).toHaveValue('All POS terminals lost connection.\n\nAction already taken: Manual receipts issued');
    expect(within(screen.getByRole('group', { name: 'Priority' })).getByRole('button', { name: 'Critical' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByRole('group', { name: 'Severity' })).getByRole('button', { name: 'High' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByRole('group', { name: 'Task Scope' })).getByRole('button', { name: 'Internal' })).toHaveAttribute('aria-pressed', 'true');
    // Values outside the canonical option lists stay visible instead of being dropped.
    expect(screen.getByRole('combobox', { name: 'Location' })).toHaveValue('360 Mall');
    expect(screen.getByRole('combobox', { name: 'Zone' })).toHaveValue('Zone B');
    expect(screen.getByRole('combobox', { name: 'Area' })).toHaveValue('Front of house');
    expect(screen.getByRole('combobox', { name: 'Sub-area' })).toHaveValue('Main cashier bank — tills 1–6');
    expect(screen.getByText('Carried from the incident')).toBeVisible();
    expect(screen.getByText('Switch_log.pdf')).toBeVisible();
    expect(screen.getByText('Queue_photo.jpg')).toBeVisible();
  });

  it('keeps prefilled values selectable alongside the canonical options', async () => {
    const user = userEvent.setup();
    renderDialog();
    fireEvent.focus(screen.getByRole('combobox', { name: 'Zone' }));
    expect(screen.getByRole('option', { name: 'Zone B' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Wonder Zone' })).toBeVisible();
    await user.click(screen.getByRole('option', { name: 'Wonder Zone' }));
    expect(screen.getByRole('combobox', { name: 'Zone' })).toHaveValue('Wonder Zone');
  });

  it('confirms once through Create task without reading the form fields', async () => {
    const user = userEvent.setup();
    const { onCancel, onConfirm } = renderDialog();
    await user.clear(screen.getByLabelText('Task subject'));
    await user.type(screen.getByLabelText('Task subject'), 'Edited and ignored');
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('does not touch the task store on confirm', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    expect(useTasksStore.getState().createdTasks).toHaveLength(0);
  });

  it.each([
    ['Cancel', () => screen.getByRole('button', { name: 'Cancel' })],
    ['Close', () => screen.getByRole('button', { name: 'Close' })],
  ])('cancels through %s without confirming', async (_label, target) => {
    const user = userEvent.setup();
    const { onCancel, onConfirm } = renderDialog();
    await user.click(target());
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('cancels on Escape', async () => {
    const user = userEvent.setup();
    const { onCancel, onConfirm } = renderDialog();
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('keeps the nested QR dialog independent of the task dialog', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();
    await user.click(screen.getByRole('button', { name: 'Scan QR Code' }));
    expect(screen.getByRole('dialog', { name: 'Scan Asset QR Code' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Enter Manually' }));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('uses responsive width and column classes for narrow viewports', () => {
    renderDialog();
    expect(screen.getByRole('dialog')).toHaveClass('w-[min(1080px,calc(100%-32px))]');
    expect(screen.getByTestId('create-task-grid')).toHaveClass('grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]');
  });

  it('renders Arabic copy and keeps the document RTL', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    renderDialog();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'إنشاء مهمة' })).toBeVisible();
    expect(within(dialog).getByText('من الحادث')).toBeVisible();
    expect(within(dialog).getByText('يبقى الحادث مفتوحاً ومرتبطاً بالمهمة الجديدة.')).toBeVisible();
    expect(within(dialog).getByText('مُرحّلة من الحادث')).toBeVisible();
    expect(within(dialog).getByRole('button', { name: 'إلغاء' })).toBeVisible();
    expect(document.documentElement.dir).toBe('rtl');
  });
});

describe('M10.3 homeTask mode (Home Assigned and Live Incidents task form)', () => {
  const homePrefill: TaskFormPrefill = { location: 'Riyadh Park', priority: 'high', scope: 'internal', subject: 'Repair escalator B2' };

  function renderHomeTask(onCancel = vi.fn()) {
    render(<TaskFormDialog mode="homeTask" onCancel={onCancel} prefill={homePrefill} presentation="modal" sourceId="JO-7779" title="Repair escalator B2" />);
    return onCancel;
  }

  it('opens with the record id and title in the header and no footer', () => {
    renderHomeTask();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-mode', 'homeTask');
    expect(dialog).toHaveAttribute('data-presentation', 'modal');
    expect(within(dialog).getByText('JO-7779')).toBeVisible();
    expect(within(dialog).getByRole('heading', { name: 'Repair escalator B2' })).toBeVisible();
    expect(within(dialog).queryByRole('heading', { name: 'Raise a task' })).not.toBeInTheDocument();
    expect(within(dialog).queryByText('from incident')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('The incident stays open and links to the new task.')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Create' })).not.toBeInTheDocument();
  });

  it('seeds the canonical create form from the prefill', () => {
    renderHomeTask();
    expect(screen.getByLabelText('Task subject')).toHaveValue('Repair escalator B2');
    expect(within(screen.getByRole('group', { name: 'Priority' })).getByRole('button', { name: 'High' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('closes from the close button and discards the form', async () => {
    const user = userEvent.setup();
    const onCancel = renderHomeTask();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(useTasksStore.getState().createdTasks).toHaveLength(0);
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = renderHomeTask();
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('M9.2 preserves M8.3 Create Task page behaviour', () => {
  it('still renders its own Create/Cancel bar, flash and page test id, with blank defaults', async () => {
    const user = userEvent.setup();
    render(<CreateTaskPage />);
    expect(screen.getByTestId('create-task-page')).toBeVisible();
    expect(screen.queryByTestId('task-form-body')).not.toBeInTheDocument();
    expect(screen.queryByText('Carried from the incident')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Task subject')).toHaveValue('');
    expect(screen.getByLabelText('Details')).toHaveValue('');
    expect(within(screen.getByRole('group', { name: 'Priority' })).getByRole('button', { name: 'Medium' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    expect(screen.getByRole('status')).toHaveTextContent('Task created');
    expect(useTasksStore.getState().createdTasks).toHaveLength(1);
    expect(screen.getByTestId('create-task-grid')).toHaveClass('grid-cols-[repeat(auto-fit,minmax(320px,1fr))]');
  });
});
