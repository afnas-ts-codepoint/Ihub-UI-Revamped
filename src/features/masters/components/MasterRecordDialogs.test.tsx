import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { MasterEditDialog, MasterViewDialog } from './MasterRecordDialogs';
import {
  ASSIGNMENT_AREAS,
  MACHINE_MASTER,
  PROJECT_CATEGORY_MASTER,
  SUB_AREA,
  TASK_MAPPING,
} from '../domain/definitions';
import type { MasterDefinition } from '../domain/types';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

const definitions = [
  PROJECT_CATEGORY_MASTER,
  ASSIGNMENT_AREAS,
  TASK_MAPPING,
  SUB_AREA,
  MACHINE_MASTER,
] as const;

function firstRow(definition: MasterDefinition) {
  const row = definition.seedRows[0];
  if (!row) throw new Error(`Missing fixture for ${definition.mode}`);
  return row;
}

describe('MasterViewDialog mode parity', () => {
  it.each(definitions)('$mode renders the source row read-only and closes without mutation', async (definition) => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onEdit = vi.fn();
    const record = firstRow(definition);
    render(<MasterViewDialog definition={definition} onClose={onClose} onEdit={onEdit} record={record} title={definition.label} />);

    const dialog = screen.getByTestId('master-view-dialog');
    expect(within(dialog).getByRole('heading', { name: `View ${definition.label}` })).toBeVisible();
    if (record.createdOn) expect(within(dialog).getByText(record.createdOn)).toBeVisible();
    expect(within(dialog).getByText(record.status === 'active' ? 'Active' : 'Inactive')).toBeVisible();
    expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('combobox')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('radio')).not.toBeInTheDocument();

    const footerClose = within(dialog).getAllByRole('button', { name: 'Close' })[1];
    if (!footerClose) throw new Error('Expected View footer Close action');
    await user.click(footerClose);
    expect(onClose).toHaveBeenCalledOnce();
    expect(onEdit).not.toHaveBeenCalled();
  });
});

describe('MasterEditDialog mode parity', () => {
  it.each(definitions)('$mode loads source values and Cancel leaves the row untouched', async (definition) => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSave = vi.fn();
    const record = firstRow(definition);
    render(<MasterEditDialog definition={definition} onClose={onClose} onSave={onSave} record={record} title={definition.label} />);

    const dialog = screen.getByTestId('master-edit-dialog');
    expect(within(dialog).getByRole('heading', { name: `Edit ${definition.label}` })).toBeVisible();
    if (definition.mode === 'pc' || definition.mode === 'aa' || definition.mode === 'sa') {
      expect(within(dialog).getByRole('textbox', { name: 'Name' })).toHaveValue(record.name);
    }
    if (definition.mode === 'aa' || definition.mode === 'sa') {
      expect(within(dialog).getByRole('combobox', { name: 'Location' })).toHaveValue(record.location);
      expect(within(dialog).getByRole('combobox', { name: 'Zone' })).toHaveValue(record.zone);
    }
    if (definition.mode === 'tm') {
      expect(within(dialog).getByRole('button', { name: 'Location' })).toHaveTextContent(record.location ?? '');
      expect(within(dialog).getByRole('button', { name: 'Area' })).toHaveTextContent(record.area ?? '');
    }
    if (definition.mode === 'generic') {
      expect(within(dialog).getByRole('combobox', { name: 'Owner Department' })).toHaveValue(record.dept);
      expect(within(dialog).getByRole('button', { name: 'Save changes' })).toBeDisabled();
    }

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });
});
