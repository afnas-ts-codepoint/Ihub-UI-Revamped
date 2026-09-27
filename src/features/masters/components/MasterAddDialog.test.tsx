import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { MasterAddDialog } from './MasterAddDialog';
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

function open(definition: MasterDefinition) {
  const onClose = vi.fn();
  render(<MasterAddDialog definition={definition} onClose={onClose} title={definition.label} />);
  return { dialog: screen.getByTestId('master-add-dialog'), onClose };
}

async function pick(user: UserEvent, dialog: HTMLElement, label: string, option: string) {
  const control = within(dialog).getByRole('combobox', { name: label });
  await user.click(control);
  await user.type(control, option);
  await user.keyboard('{Enter}');
  expect(control).toHaveValue(option);
}

async function pickControl(user: UserEvent, control: HTMLElement, option: string) {
  await user.click(control);
  await user.type(control, option);
  await user.keyboard('{Enter}');
  expect(control).toHaveValue(option);
}

async function pickMulti(user: UserEvent, dialog: HTMLElement, label: string, option: string) {
  await user.click(within(dialog).getByRole('button', { name: label }));
  await user.click(await screen.findByRole('checkbox', { name: option }));
  await user.keyboard('{Escape}');
}

async function submitAndExpectClose(user: UserEvent, dialog: HTMLElement, onClose: ReturnType<typeof vi.fn>) {
  const save = within(dialog).getByRole('button', { name: 'Save' });
  expect(save).toBeEnabled();
  await user.click(save);
  expect(onClose).toHaveBeenCalledOnce();
}

describe('MasterAddDialog specialized modes', () => {
  it('Project Category starts with one required row, supports repeatable rows, and valid submit only closes', async () => {
    const user = userEvent.setup();
    const { dialog, onClose } = open(PROJECT_CATEGORY_MASTER);
    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'Sample CSV' })).toHaveAttribute('data-prototype-noop', 'm4.3-bulk-import');

    await user.click(within(dialog).getByRole('button', { name: 'Add more' }));
    const names = within(dialog).getAllByRole('textbox', { name: 'Name' });
    expect(names).toHaveLength(2);
    const firstName = names[0];
    if (!firstName) throw new Error('Expected first Project Category row');
    await user.type(firstName, 'New category');
    await submitAndExpectClose(user, dialog, onClose);
  });

  it('Assignment Areas narrows Zone by Location, requires an area name, and valid submit only closes', async () => {
    const user = userEvent.setup();
    const { dialog, onClose } = open(ASSIGNMENT_AREAS);
    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeDisabled();

    await pick(user, dialog, 'Location', 'WAREHOUSE MALL');
    await pick(user, dialog, 'Zone', 'FUNTIKI-WAREHOUSE');
    await user.type(within(dialog).getByRole('textbox', { name: 'Name' }), 'New area');
    await submitAndExpectClose(user, dialog, onClose);
  });

  it('Sub Area requires the cascaded location, zone, assignment area and name, then only closes', async () => {
    const user = userEvent.setup();
    const { dialog, onClose } = open(SUB_AREA);
    expect(within(dialog).getByRole('button', { name: 'Upload Excel' })).toHaveAttribute('data-prototype-noop', 'm4.3-bulk-import');

    await pick(user, dialog, 'Location', 'WAREHOUSE MALL');
    await pick(user, dialog, 'Zone', 'FUNTIKI-WAREHOUSE');
    await pick(user, dialog, 'Assignment Area', 'Facility Maintenance');
    await user.type(within(dialog).getByRole('textbox', { name: 'Sub Area' }), 'New sub area');
    await submitAndExpectClose(user, dialog, onClose);
  });

  it('Task Mapping provides chips, exact note, swatches and medium priority, then valid submit only closes', async () => {
    const user = userEvent.setup();
    const { dialog, onClose } = open(TASK_MAPPING);
    expect(within(dialog).getByText('Note : Separate Sub area will created for each area.')).toBeVisible();
    expect(within(dialog).getAllByRole('radio', { name: 'Medium' })[1]).toBeChecked();

    await pickMulti(user, dialog, 'Location', '360 MALL');
    await pickMulti(user, dialog, 'Zone', 'FnB FUNTIKI - 360');
    await pickMulti(user, dialog, 'Area', 'Main Rides');
    await pickMulti(user, dialog, 'Sub Area', 'Roller Coaster Zone');
    await pick(user, dialog, 'Owner Department', 'Operations Department');
    await submitAndExpectClose(user, dialog, onClose);
  });
});

describe('MasterAddDialog generic multi-row mode', () => {
  it('starts with one mapping row, adds another without a remove control, validates every row, and only closes', async () => {
    const user = userEvent.setup();
    const { dialog, onClose } = open(MACHINE_MASTER);
    expect(within(dialog).getByText('Mapping Row 1')).toBeVisible();
    expect(within(dialog).queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();

    await pick(user, dialog, 'Location', 'Al Kout Mall');
    await pick(user, dialog, 'Zone', 'Zone A');
    await pick(user, dialog, 'Area', 'Main Rides');
    await pick(user, dialog, 'Owner Department', 'Operations Department');
    await user.click(within(dialog).getByRole('button', { name: 'Add another row' }));
    expect(within(dialog).getByText('Mapping Row 2')).toBeVisible();
    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeDisabled();

    const areas = within(dialog).getAllByRole('combobox', { name: 'Area' });
    const secondArea = areas[1];
    if (!secondArea) throw new Error('Expected second generic Area control');
    await pickControl(user, secondArea, 'Grand Avenue');
    const departments = within(dialog).getAllByRole('combobox', { name: 'Owner Department' });
    const secondDepartment = departments[1];
    if (!secondDepartment) throw new Error('Expected second generic Department control');
    await pickControl(user, secondDepartment, 'Safety Department');
    await submitAndExpectClose(user, dialog, onClose);
  });
});
