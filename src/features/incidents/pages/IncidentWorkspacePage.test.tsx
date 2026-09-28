import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { IncidentWorkspacePage } from './IncidentWorkspacePage';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => { cleanup(); await i18n.changeLanguage('en'); });

function openListing() {
  render(<IncidentWorkspacePage />);
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

  it('keeps Raise a task behind MigrationPending', async () => {
    openListing(); await openFirstMenu(); fireEvent.click(screen.getByRole('menuitem', { name: 'Raise a task' }));
    expect(screen.getByRole('status')).toHaveTextContent('Raise a task');
    expect(screen.queryByRole('button', { name: 'Create task' })).not.toBeInTheDocument();
  });

  it('renders Arabic RTL labels', async () => {
    await i18n.changeLanguage('ar');
    const { container } = render(<IncidentWorkspacePage />);
    expect(screen.getByRole('button', { name: 'إنشاء تقرير حادث' })).toBeVisible();
    expect(container.querySelector('section')).toBeInTheDocument();
  });
});
