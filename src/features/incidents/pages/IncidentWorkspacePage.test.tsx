import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { IncidentWorkspacePage } from './IncidentWorkspacePage';
import { useTasks } from '@/features/tasks';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => { cleanup(); await i18n.changeLanguage('en'); });

/** Observes the task store through the tasks public API: incident conversion must never write to it. */
function TaskCountProbe() {
  return <output data-testid="task-count">{useTasks().length}</output>;
}

function openListing() {
  render(<><IncidentWorkspacePage /><TaskCountProbe /></>);
  fireEvent.click(screen.getByRole('button', { name: 'Incident Listing' }));
}

async function openFirstMenu() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Actions INC-2041' }));
  await screen.findByRole('menuitem', { name: 'Track' });
}

describe('M7.5 Incident workspace', () => {
  it('defaults to the report and keeps submit and draft ungated', () => {
    render(<IncidentWorkspacePage />);
    const submit = screen.getByRole('button', { name: 'Submit report' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(screen.getByText('Incident report submitted')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(screen.getByText('Draft saved')).toBeVisible();
  });

  it('clears entered report values without navigation or persistence', () => {
    render(<IncidentWorkspacePage />);
    const input = screen.getByLabelText('Specific area of incident');
    fireEvent.change(input, { target: { value: 'Bay 3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(input).toHaveValue('');
    expect(screen.getByRole('heading', { name: 'Create Incident Report' })).toBeVisible();
  });

  it('shows exact rows, counts, and inert pagination', () => {
    openListing();
    expect(screen.getByRole('tab', { name: 'Open 3' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Closed 2' })).toBeVisible();
    expect(screen.getAllByText(/INC-20/)).toHaveLength(5);
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(screen.getByText('INC-2041')).toBeVisible();
  });

  it('opens the read-only detail modal with fixture history and documents', () => {
    openListing();
    fireEvent.click(screen.getByRole('button', { name: 'Edit report INC-2041' }));
    expect(screen.getByText('Read only')).toBeVisible();
    expect(screen.getByText('Switch_log.pdf')).toBeVisible();
    expect(screen.getByText('History & updates')).toBeVisible();
    expect(screen.getByText('4 events')).toBeVisible();
  });

  it('tracks locally, adds history, and does not duplicate the row', async () => {
    openListing();
    await openFirstMenu();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Track' }));
    expect(screen.getByText('INC-2041 added to tracking · shows in Overview')).toBeVisible();
    expect(screen.getByText('Tracking')).toBeVisible();
    expect(screen.getAllByText('INC-2041')).toHaveLength(1);
  });

  it.each([
    ['Request investigation', 'Request investigation · INC-2041'],
    ['Callback request', 'Callback request · INC-2041'],
    ['Close case', 'Close case · INC-2041'],
  ])('keeps %s message-only', async (action, message) => {
    openListing(); await openFirstMenu(); fireEvent.click(screen.getByRole('menuitem', { name: action }));
    expect(screen.getByText(message)).toBeVisible();
    expect(screen.getByRole('row', { name: /INC-2041/ })).toHaveTextContent('Open');
  });

  it('gates compensation only by type and non-whitespace details', async () => {
    openListing(); await openFirstMenu(); fireEvent.click(screen.getByRole('menuitem', { name: 'Compensate' }));
    const save = screen.getByRole('button', { name: 'Record compensation' });
    expect(save).toBeDisabled();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Compensation type' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Refund' }));
    fireEvent.change(screen.getByLabelText('Compensation details'), { target: { value: '  ' } });
    expect(save).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Compensation details'), { target: { value: 'Approved locally' } });
    expect(save).toBeEnabled();
    fireEvent.click(save);
    expect(screen.getByText('INC-2041 · compensation recorded')).toBeVisible();
  });

  it('requires non-whitespace feedback and records it locally', async () => {
    openListing(); await openFirstMenu(); fireEvent.click(screen.getByRole('menuitem', { name: 'Write feedback' }));
    const save = screen.getByRole('button', { name: 'Save feedback' });
    fireEvent.change(screen.getByLabelText('Feedback'), { target: { value: '  ' } });
    expect(save).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Feedback'), { target: { value: 'Follow up tomorrow' } });
    fireEvent.click(save);
    expect(screen.getByText('INC-2041 · feedback saved')).toBeVisible();
  });

  describe('Raise a task (M9.2)', () => {
    async function openRaise(id = 'INC-2041') {
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: `Actions ${id}` }));
      await user.click(await screen.findByRole('menuitem', { name: 'Raise a task' }));
      return { dialog: await screen.findByRole('dialog', { name: 'Raise a task' }), user };
    }
    const create = (dialog: HTMLElement) => within(dialog).getByRole('button', { name: 'Create task' });

    it('opens the task form dialog prefilled from the incident instead of the MigrationPending boundary', async () => {
      openListing();
      const { dialog } = await openRaise();
      expect(within(dialog).getByText('from incident')).toBeVisible();
      expect(within(dialog).getByText('INC-2041')).toBeVisible();
      expect(within(dialog).getByLabelText('Task subject')).toHaveValue('Follow-up: POS network outage — 360 Mall');
      expect((within(dialog).getByLabelText<HTMLTextAreaElement>('Details')).value).toContain('Action already taken: Manual receipts issued, queue managed, IT escalated to vendor.');
      expect(within(within(dialog).getByRole('group', { name: 'Priority' })).getByRole('button', { name: 'Critical', pressed: true })).toBeVisible();
      expect(within(within(dialog).getByRole('group', { name: 'Severity' })).getByRole('button', { name: 'Critical', pressed: true })).toBeVisible();
      expect(within(dialog).getByText('Switch_log.pdf')).toBeVisible();
      expect(within(dialog).getByText('Queue_photo.jpg')).toBeVisible();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('cancels without converting, flashing or touching the row', async () => {
      openListing();
      const { dialog, user } = await openRaise();
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog', { name: 'Raise a task' })).not.toBeInTheDocument();
      expect(screen.getByRole('row', { name: /INC-2041/ })).toHaveTextContent('Open');
      expect(screen.getByRole('row', { name: /INC-2041/ })).not.toHaveTextContent('TSK-2026');
      expect(screen.queryByText(/raised as task/)).not.toBeInTheDocument();
    });

    it('converts on Create task: status, reference chip, flash, local history, no task-store write, no duplicate row', async () => {
      openListing();
      const tasksBefore = screen.getByTestId('task-count').textContent;
      const { dialog, user } = await openRaise();
      await user.click(create(dialog));
      expect(screen.queryByRole('dialog', { name: 'Raise a task' })).not.toBeInTheDocument();
      expect(screen.getByText('INC-2041 raised as task · TSK-2026-318')).toBeVisible();
      const row = screen.getByRole('row', { name: /INC-2041/ });
      expect(row).toHaveTextContent('Converted to task');
      expect(within(row).getByText('TSK-2026-318')).toBeVisible();
      expect(screen.getAllByText(/^INC-2041$/)).toHaveLength(1);
      expect(screen.getByTestId('task-count')).toHaveTextContent(tasksBefore);
      fireEvent.click(screen.getByRole('button', { name: 'Edit report INC-2041' }));
      expect(screen.getByText('Incident raised as task TSK-2026-318 — routed to the assigned owner in Tasks.')).toBeVisible();
      expect(screen.getByText('5 events')).toBeVisible();
    });

    it('ignores edits made inside the embedded form (verified prototype no-op)', async () => {
      openListing();
      const tasksBefore = screen.getByTestId('task-count').textContent;
      const { dialog, user } = await openRaise();
      await user.clear(within(dialog).getByLabelText('Task subject'));
      await user.type(within(dialog).getByLabelText('Task subject'), 'Something else entirely');
      await user.click(create(dialog));
      expect(screen.getByRole('row', { name: /INC-2041/ })).toHaveTextContent('POS network outage — 360 Mall');
      expect(screen.queryByText('Something else entirely')).not.toBeInTheDocument();
      expect(screen.getByTestId('task-count')).toHaveTextContent(tasksBefore);
    });

    it('allocates references sequentially across incidents', async () => {
      openListing();
      let raised = await openRaise('INC-2041');
      await raised.user.click(create(raised.dialog));
      raised = await openRaise('INC-2039');
      await raised.user.click(create(raised.dialog));
      expect(within(screen.getByRole('row', { name: /INC-2041/ })).getByText('TSK-2026-318')).toBeVisible();
      expect(within(screen.getByRole('row', { name: /INC-2039/ })).getByText('TSK-2026-319')).toBeVisible();
    });

    it('keeps the menu action enabled after conversion but returns the existing reference without a second history entry or sequence number', async () => {
      openListing();
      let raised = await openRaise();
      await raised.user.click(create(raised.dialog));
      raised = await openRaise();
      await raised.user.click(create(raised.dialog));
      expect(screen.getByText('INC-2041 raised as task · TSK-2026-318')).toBeVisible();
      raised = await openRaise('INC-2039');
      await raised.user.click(create(raised.dialog));
      expect(within(screen.getByRole('row', { name: /INC-2039/ })).getByText('TSK-2026-319')).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'Edit report INC-2041' }));
      expect(screen.getByText('5 events')).toBeVisible();
    });

    it('opens from the detail dialog, disables its Raise a task button after conversion and keeps the detail snapshot status', async () => {
      openListing();
      fireEvent.click(screen.getByRole('button', { name: 'Edit report INC-2041' }));
      const detail = screen.getByRole('dialog');
      const trigger = within(detail).getByRole('button', { name: 'Raise a task' });
      expect(trigger).toBeEnabled();
      const user = userEvent.setup();
      await user.click(trigger);
      const dialog = await screen.findByRole('dialog', { name: 'Raise a task' });
      await user.click(create(dialog));
      const reopened = await screen.findByRole('dialog');
      expect(within(reopened).getByRole('button', { name: 'Raise a task' })).toBeDisabled();
      expect(within(reopened).getByText('5 events')).toBeVisible();
      expect(within(reopened).queryByText('Converted to task')).not.toBeInTheDocument();
    });

    it('flashes the Arabic confirmation and keeps RTL labels', async () => {
      await i18n.changeLanguage('ar');
      document.documentElement.dir = 'rtl';
      render(<IncidentWorkspacePage />);
      fireEvent.click(screen.getByRole('button', { name: 'قائمة الحوادث' }));
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'الإجراءات INC-2041' }));
      await user.click(await screen.findByRole('menuitem', { name: 'إنشاء مهمة' }));
      const dialog = await screen.findByRole('dialog', { name: 'إنشاء مهمة' });
      expect(within(dialog).getByText('من الحادث')).toBeVisible();
      await user.click(within(dialog).getByRole('button', { name: 'إنشاء مهمة' }));
      expect(screen.getByText('INC-2041 حُوّل إلى مهمة · TSK-2026-318')).toBeVisible();
      document.documentElement.dir = 'ltr';
    });
  });

  it('renders Arabic RTL labels', async () => {
    await i18n.changeLanguage('ar');
    const { container } = render(<IncidentWorkspacePage />);
    expect(screen.getByRole('button', { name: 'إنشاء تقرير حادث' })).toBeVisible();
    expect(container.querySelector('section')).toBeInTheDocument();
  });
});
