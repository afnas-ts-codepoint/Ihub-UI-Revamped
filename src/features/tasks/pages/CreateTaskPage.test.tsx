import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { CreateTaskPage } from './CreateTaskPage';
import { TasksPage } from './TasksPage';
import { useTasksStore } from '../store/tasks.store';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  useTasksStore.getState().reset();
  vi.restoreAllMocks();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

async function pick(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  fireEvent.focus(screen.getByRole('combobox', { name: label }));
  await user.click(screen.getByRole('option', { name: option }));
}

describe('M8.3 Create Task page', () => {
  it('renders the adopted three-column form inventory without stale-plan sections', () => {
    render(<CreateTaskPage />);
    expect(screen.getByRole('heading', { name: 'Task Details' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Attachments' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Location and Zone' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Asset / Machine Information' })).toBeVisible();
    expect(screen.getAllByRole('heading', { name: 'Task Classification' })).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Reference Numbers' })).toBeVisible();
    for (const name of [
      'Task subject',
      'Project Name',
      'Project Category',
      'Details',
      'Start date',
      'End date / Target completion',
      'Asset Category',
      'Asset Name',
      'Asset Code',
      'Category',
      'Task Type',
      'Risk / Impacted Category',
      'Impacted Area',
      'Touchpoint',
      'Guest Satisfaction KPI',
      'Process Owner',
      'Matrix Partner',
      'Requester Type / Role',
      'Enquiry #',
      'Observation #',
      'Incident #',
    ]) {
      expect(screen.getByLabelText(name)).toBeVisible();
    }
    expect(screen.queryByText('Checklist')).not.toBeInTheDocument();
    expect(screen.queryByText('Dependencies')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Another')).not.toBeInTheDocument();
    expect(screen.queryByText('Sample attachments')).not.toBeInTheDocument();
    expect(screen.queryByText('Save Draft')).not.toBeInTheDocument();
    expect(screen.getByTestId('create-task-grid')).toHaveClass(
      'grid-cols-[repeat(auto-fit,minmax(320px,1fr))]',
    );
  });

  it('accepts an empty submission, prepends Untitled task, stays visible, and does not reset entered data', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_789_012_345_678);
    const user = userEvent.setup();
    const view = render(<CreateTaskPage />);
    await user.type(screen.getByLabelText('Project Name'), 'Keep this value');
    await user.click(screen.getByRole('button', { name: 'Create task' }));

    expect(screen.getByRole('status')).toHaveTextContent('Task created');
    expect(screen.getByTestId('create-task-page')).toBeVisible();
    expect(screen.getByLabelText('Project Name')).toHaveValue('Keep this value');
    expect(useTasksStore.getState().createdTasks[0]).toMatchObject({
      department: 'Operations',
      dependencies: 0,
      id: 'TASK-345678',
      kind: 'internal',
      stage: 'Open',
      subject: 'Untitled task',
    });

    view.unmount();
    render(<TasksPage />);
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('TASK-345678');
    expect(rows[1]).toHaveTextContent('Untitled task');
    expect(rows).toHaveLength(7);
    await user.click(screen.getByRole('button', { exact: true, name: 'Board' }));
    expect(screen.getByTestId('task-board')).toHaveTextContent('Untitled task');
  });

  it('adds a location when either Location or Zone is present and removes it', async () => {
    const user = userEvent.setup();
    render(<CreateTaskPage />);
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.queryByTestId('location-row')).not.toBeInTheDocument();

    await pick(user, 'Zone', 'Wonder Zone');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    const row = screen.getByTestId('location-row');
    expect(row).toHaveTextContent('Wonder Zone');
    expect(screen.getByText('1 added')).toBeVisible();
    await user.click(within(row).getByRole('button', { name: 'Remove Wonder Zone' }));
    expect(screen.queryByTestId('location-row')).not.toBeInTheDocument();
  });

  it('simulates QR by populating only Asset Code', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const user = userEvent.setup();
    render(<CreateTaskPage />);
    await user.click(screen.getByRole('button', { name: 'Scan QR Code' }));
    expect(screen.getByRole('dialog')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Simulate Scan' }));
    expect(screen.getByLabelText('Asset Code')).toHaveValue(
      `AST-${String(new Date().getFullYear())}-1000`,
    );
    expect(screen.getByRole('combobox', { name: 'Location' })).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Zone' })).toHaveValue('');
  });

  it('accepts unrestricted dropped files and supports download and remove', async () => {
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<CreateTaskPage />);
    const file = new File([new Uint8Array(2_200_000)], 'oversized.exe', {
      type: 'application/octet-stream',
    });
    fireEvent.drop(screen.getByTestId('attachment-drop-zone'), {
      dataTransfer: { files: [file] },
    });
    expect(screen.getByText('oversized.exe')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Download oversized.exe' }));
    expect(createObjectURL).toHaveBeenCalledWith(file);
    await user.click(screen.getByRole('button', { name: 'Remove oversized.exe' }));
    expect(screen.queryByText('oversized.exe')).not.toBeInTheDocument();
  });

  it('preserves requester defaults/editability and assignment/reference controls', async () => {
    const user = userEvent.setup();
    render(<CreateTaskPage />);
    expect(screen.getByLabelText('Requested By')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Requester Department')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Source')).toHaveAttribute('readonly');
    expect(screen.getByText('0 days')).toBeVisible();
    await pick(user, 'Requester Type / Role', 'Supervisor');
    expect(screen.getByRole('combobox', { name: 'Requester Type / Role' })).toHaveValue('Supervisor');
    await pick(user, 'Matrix Partner', 'Sarah Johnson');
    expect(screen.getByText('Sarah Johnson')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Remove Sarah Johnson' }));
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument();
    await pick(user, 'Enquiry #', 'ENQ-118 — Party booking availability, Al Kout');
    expect(screen.getByRole('combobox', { name: 'Enquiry #' })).toHaveValue(
      'ENQ-118 — Party booking availability, Al Kout',
    );
  });

  it('renders Arabic controls in RTL while preserving literal fixture values', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    render(<CreateTaskPage />);
    expect(screen.getByRole('heading', { name: 'تفاصيل المهمة' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'إنشاء مهمة' })).toBeVisible();
    expect(screen.getByLabelText('مقدّم الطلب')).toHaveValue('Tom Baker');
    expect(screen.getByLabelText('إدارة مقدّم الطلب')).toHaveValue('Operations');
    expect(screen.getByLabelText('المصدر')).toHaveValue('Generic');
  });
});
