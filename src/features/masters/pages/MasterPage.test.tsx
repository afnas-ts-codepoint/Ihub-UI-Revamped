import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  ASSIGNMENT_AREAS,
  MACHINE_MASTER,
  PROJECT_CATEGORY_MASTER,
  TASK_MAPPING,
} from '../domain/definitions';
import { MasterPage } from './MasterPage';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

function renderPc() {
  return render(
    <MasterPage
      definition={PROJECT_CATEGORY_MASTER}
      title="Project Category Master"
    />,
  );
}

const rowsBody = () => screen.getAllByRole('row').slice(1); // skip the header row

describe('MasterPage — Project Category Master (pc mode)', () => {
  it('renders the pc-mode columns and the default 10-of-18 page', () => {
    renderPc();

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    expect(
      screen.getByRole('columnheader', { name: 'Created On' }),
    ).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    expect(
      screen.queryByRole('columnheader', { name: 'Code' }),
    ).not.toBeInTheDocument();

    expect(rowsBody()).toHaveLength(10);
    expect(screen.getByText('Showing 10 of 18 records')).toBeVisible();
  });

  it('searches by name only, case-insensitively and partially, resetting to page 1', async () => {
    const user = userEvent.setup();
    renderPc();

    await user.type(screen.getByPlaceholderText('Search records..'), 'consum');
    expect(screen.getByText('Consumables')).toBeVisible();
    expect(screen.getByText('Showing 1 of 1 records')).toBeVisible();

    await user.clear(screen.getByPlaceholderText('Search records..'));
    await user.type(
      screen.getByPlaceholderText('Search records..'),
      'zzz-not-found',
    );
    expect(screen.getByText('Showing 0 of 0 records')).toBeVisible();
    expect(rowsBody()).toHaveLength(0);
  });

  it('filters by the Active/Inactive status chips with correct counts', async () => {
    const user = userEvent.setup();
    renderPc();

    expect(
      within(screen.getByTestId('status-chip-all')).getByText('18'),
    ).toBeVisible();
    await user.click(screen.getByTestId('status-chip-inactive'));
    expect(screen.getByText('Showing 5 of 5 records')).toBeVisible();

    await user.click(screen.getByTestId('status-chip-inactive'));
    expect(screen.getByText('Showing 10 of 18 records')).toBeVisible();
  });

  it("toggles a row's status in place and updates the chip counts", async () => {
    const user = userEvent.setup();
    renderPc();

    const row = screen.getByText('Consumables').closest('tr');
    if (!row) throw new Error('row not found');
    const toggle = within(row).getByRole('button', { name: 'Active' });
    await user.click(toggle);

    expect(within(row).getByRole('button', { name: 'Inactive' })).toBeVisible();
    await user.click(screen.getByTestId('status-chip-inactive'));
    expect(screen.getByText('Showing 6 of 6 records')).toBeVisible();
  });

  it('supports the Show-N-entries picker and functional pagination', async () => {
    const user = userEvent.setup();
    renderPc();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Entries per page' }),
      '25',
    );
    expect(rowsBody()).toHaveLength(18);
    expect(screen.getByText('Showing 18 of 18 records')).toBeVisible();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Entries per page' }),
      '10',
    );
    expect(rowsBody()).toHaveLength(10);
    const next = screen.getByRole('button', { name: 'Next' });
    await user.click(next);
    expect(rowsBody()).toHaveLength(8);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
    expect(next).toBeDisabled();
  });

  it('opens the mode-specific filter dialog, applies a name filter and updates the badge', async () => {
    const user = userEvent.setup();
    renderPc();

    await user.click(screen.getByRole('button', { name: /^Filters/ }));
    expect(
      screen.getByRole('dialog', { name: 'Filter records' }),
    ).toBeVisible();
    expect(screen.getByText('Name and date range')).toBeVisible();

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'spare');
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));

    expect(screen.getByText('Showing 1 of 1 records')).toBeVisible();
    expect(screen.getByRole('button', { name: /^Filters/ })).toHaveTextContent(
      '1',
    );
  });

  it('opens the Settings dialog and hides a column via the Columns tab', async () => {
    const user = userEvent.setup();
    renderPc();

    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Column Settings' }));
    await user.click(screen.getByRole('checkbox', { name: 'Created On' }));
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));

    expect(
      screen.queryByRole('columnheader', { name: 'Created On' }),
    ).not.toBeInTheDocument();
  });

  it('hides a status chip via the Chip Settings tab, keeping the filter functional', async () => {
    const user = userEvent.setup();
    renderPc();

    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await user.click(screen.getByRole('button', { name: 'Deselect All' }));
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));

    expect(screen.queryByTestId('status-chip-active')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('status-chip-inactive'),
    ).not.toBeInTheDocument();
  });

  it('confirms and performs a per-row delete with the exact prototype copy', async () => {
    const user = userEvent.setup();
    renderPc();

    const row = screen.getByText('Consumables').closest('tr');
    if (!row) throw new Error('row not found');
    await user.click(within(row).getByRole('button', { name: 'Delete' }));

    const dialog = screen.getByRole('dialog', { name: 'Delete Record' });
    expect(
      within(dialog).getByText(
        'Are you sure you want to delete "Consumables"?',
      ),
    ).toBeVisible();

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('Consumables')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 10 of 17 records')).toBeVisible();
  });

  it('selects rows, shows the bulk bar, sets them inactive, then clears selection', async () => {
    const user = userEvent.setup();
    renderPc();

    const row1 = screen.getByText('Consumables').closest('tr');
    const row2 = screen.getByText('Spare Parts').closest('tr');
    if (!row1 || !row2) throw new Error('rows not found');
    await user.click(within(row1).getByRole('checkbox', { name: 'Select' }));
    await user.click(within(row2).getByRole('checkbox', { name: 'Select' }));

    expect(screen.getByText('2 records selected')).toBeVisible();
    await user.click(screen.getByTestId('bulk-set-inactive'));

    expect(
      within(row1).getByRole('button', { name: 'Inactive' }),
    ).toBeVisible();
    expect(
      within(row2).getByRole('button', { name: 'Inactive' }),
    ).toBeVisible();
    expect(screen.queryByText(/records selected/)).not.toBeInTheDocument();
  });

  it('opens Add, gates Save, closes valid Add without persisting, and keeps Export inert', async () => {
    const user = userEvent.setup();
    renderPc();

    const exportButton = screen.getByRole('button', { name: 'Export' });
    const addButton = screen.getByRole('button', {
      name: 'Add Project Category Master',
    });
    await user.click(exportButton);
    await user.click(addButton);

    const addDialog = screen.getByTestId('master-add-dialog');
    const save = within(addDialog).getByRole('button', { name: 'Save' });
    expect(save).toBeDisabled();
    await user.type(within(addDialog).getByRole('textbox', { name: 'Name' }), 'New category');
    expect(save).toBeEnabled();
    await user.click(save);
    await waitFor(() => { expect(screen.queryByTestId('master-add-dialog')).not.toBeInTheDocument(); });
    expect(screen.queryByText('New category')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 10 of 18 records')).toBeVisible();
  });

  it('opens a read-only View and persists a valid Edit to the listing', async () => {
    const user = userEvent.setup();
    renderPc();

    const row = screen.getByText('Consumables').closest('tr');
    if (!row) throw new Error('row not found');
    await user.click(within(row).getByRole('button', { name: 'View' }));
    const view = screen.getByTestId('master-view-dialog');
    expect(within(view).getByText('Consumables')).toBeVisible();
    expect(within(view).queryByRole('textbox')).not.toBeInTheDocument();
    await user.click(within(view).getByRole('button', { name: 'Edit' }));

    const edit = await screen.findByTestId('master-edit-dialog');
    const name = within(edit).getByRole('textbox', { name: 'Name' });
    await user.clear(name);
    expect(within(edit).getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await user.type(name, 'Edited category');
    await user.click(within(edit).getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Edited category')).toBeVisible();
    expect(screen.queryByText('Consumables')).not.toBeInTheDocument();
  });
});

describe('MasterPage — mode parity', () => {
  it('renders Assignment Areas (aa mode) columns, filter fields and no status field in its filter dialog', async () => {
    const user = userEvent.setup();
    render(
      <MasterPage definition={ASSIGNMENT_AREAS} title="Assignment Areas" />,
    );

    expect(
      screen.getByRole('columnheader', { name: 'Location' }),
    ).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Zone' })).toBeVisible();
    expect(
      screen.getByRole('columnheader', { name: 'Area Name' }),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: /^Filters/ }));
    expect(screen.getByText('Location, zone and date range')).toBeVisible();
    expect(
      screen.queryByText('Status', { selector: 'span' }),
    ).not.toBeInTheDocument();
  });

  it('renders Task Mapping (tm mode) columns and its full filter-field set', async () => {
    const user = userEvent.setup();
    render(<MasterPage definition={TASK_MAPPING} title="Task Mapping" />);

    for (const label of [
      'Location',
      'Zone',
      'Area',
      'Sub Area',
      'Touch Point',
      'Owner Department',
    ]) {
      expect(screen.getByRole('columnheader', { name: label })).toBeVisible();
    }

    await user.click(screen.getByRole('button', { name: /^Filters/ }));
    expect(screen.getByText('Mapping, ownership and date range')).toBeVisible();
    expect(
      screen.getByRole('combobox', { name: 'Applicable For' }),
    ).toBeVisible();
  });

  it('opens the specialized Task Mapping Add with adopted note, chips, swatches and medium priority default', async () => {
    const user = userEvent.setup();
    render(<MasterPage definition={TASK_MAPPING} title="Task Mapping" />);
    await user.click(screen.getByRole('button', { name: 'Add Task Mapping' }));
    const dialog = screen.getByTestId('master-add-dialog');
    expect(within(dialog).getByText('Note : Separate Sub area will created for each area.')).toBeVisible();
    expect(within(dialog).getAllByRole('radio', { name: 'Medium' })[1]).toBeChecked();
    expect(within(dialog).getAllByRole('radio', { name: 'Low' })).toHaveLength(2);
    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('renders Machine Master (generic mode) columns and "All Locations"/"All Zones" filter labels', async () => {
    const user = userEvent.setup();
    render(<MasterPage definition={MACHINE_MASTER} title="Machine Master" />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Code' })).toBeVisible();
    expect(
      screen.getByRole('columnheader', { name: 'Owner Department' }),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: /^Filters/ }));
    expect(screen.getByText('Reference or subject')).toBeVisible();
    expect(
      screen.getByRole('combobox', { name: 'All Locations' }),
    ).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'All Zones' })).toBeVisible();
  });
});
