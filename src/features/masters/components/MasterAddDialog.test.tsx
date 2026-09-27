import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { utils, write } from 'xlsx';

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

type FixtureFormat = 'csv' | 'xls' | 'xlsx';

function bulkFixture(format: FixtureFormat, withHeader: boolean) {
  const rows = [
    ...(withHeader ? [['Name', 'Ignored']] : []),
    [' Alpha ', 'Extra'],
    ['Alpha'],
    [],
    [' Beta '],
  ];

  if (format === 'csv') {
    const lines = rows.map((row) => row.join(','));
    return new File([lines.join('\r\n')], `names-${withHeader ? 'header' : 'plain'}.csv`, { type: 'text/csv' });
  }

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.aoa_to_sheet(rows), 'Names');
  const bytes = write(workbook, { bookType: format, type: 'array' }) as ArrayBuffer;
  return new File([bytes], `names-${withHeader ? 'header' : 'plain'}.${format}`);
}

function fileInput(dialog: HTMLElement) {
  const input = dialog.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('Expected bulk-import file input');
  return input;
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
    expect(within(dialog).getByRole('button', { name: 'Sample CSV' })).toBeEnabled();

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
    expect(within(dialog).getByRole('button', { name: 'Upload Excel' })).toBeEnabled();

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

describe.each([
  { definition: PROJECT_CATEGORY_MASTER, field: 'Name', kind: 'Project Category' },
  { definition: SUB_AREA, field: 'Sub Area', kind: 'Sub Area' },
] as const)('$kind bulk import', ({ definition, field }) => {
  it.each([
    ['csv', true],
    ['csv', false],
    ['xlsx', true],
    ['xlsx', false],
    ['xls', true],
    ['xls', false],
  ] as const)('imports %s with header=%s using exact prototype ordering and count semantics', async (format, withHeader) => {
    const user = userEvent.setup();
    const { dialog } = open(definition);
    const file = bulkFixture(format, withHeader);

    await user.upload(fileInput(dialog), file);

    const parsedCount = format === 'csv'
      ? withHeader ? 5 : 4
      : 3;
    const phrase = definition.mode === 'pc' ? 'records added from' : 'sub areas added from';
    expect(await within(dialog).findByTestId('bulk-import-note')).toHaveTextContent(
      `${String(parsedCount)} ${phrase} ${file.name}`,
    );

    const values = within(dialog).getAllByRole('textbox', { name: field })
      .map((input) => (input as HTMLInputElement).value);
    const expected = format === 'csv'
      ? withHeader ? ['Ignored', 'Alpha', 'Extra', 'Beta'] : ['Alpha', 'Extra', 'Beta']
      : ['Alpha', 'Beta'];
    expect(values).toEqual(expected);
  });

  it('leaves editable rows unchanged and shows the exact no-data note', async () => {
    const user = userEvent.setup();
    const { dialog } = open(definition);
    const file = new File(['Name\r\n  \r\n'], 'empty.csv', { type: 'text/csv' });
    await user.upload(fileInput(dialog), file);

    expect(within(dialog).getAllByRole('textbox', { name: field })).toHaveLength(1);
    expect(await within(dialog).findByTestId('bulk-import-note')).toHaveTextContent(
      definition.mode === 'pc'
        ? 'No records found in that file.'
        : 'No sub areas found in that file.',
    );
  });

  it('resets the file input so the same file can be selected again', async () => {
    const user = userEvent.setup();
    const { dialog } = open(definition);
    const input = fileInput(dialog);
    const file = bulkFixture('csv', true);

    await user.upload(input, file);
    expect(input).toHaveValue('');
    await user.upload(input, file);
    expect(input).toHaveValue('');
    expect(within(dialog).getAllByRole('textbox', { name: field }).map((node) => (node as HTMLInputElement).value))
      .toEqual(['Ignored', 'Alpha', 'Extra', 'Beta']);
  });
});

describe('bulk-import boundaries and sample download', () => {
  it('downloads the exact Project Category sample and exposes no sample for Sub Area', async () => {
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:sample');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function capture(this: HTMLAnchorElement) {
      downloads.push(this.download);
    });
    const user = userEvent.setup();
    const { dialog } = open(PROJECT_CATEGORY_MASTER);

    await user.click(within(dialog).getByRole('button', { name: 'Sample CSV' }));
    const blob = createUrl.mock.calls[0]?.[0] as Blob;
    expect(blob.type).toBe('text/csv;charset=utf-8;');
    expect(await blob.text()).toBe('Name\r\nConsumables\r\nSpare Parts\r\nOffice Supplies\r\n');
    expect(downloads).toEqual(['project-category-sample.csv']);

    cleanup();
    const subArea = open(SUB_AREA).dialog;
    expect(within(subArea).queryByRole('button', { name: 'Sample CSV' })).not.toBeInTheDocument();
  });

  it.each([ASSIGNMENT_AREAS, TASK_MAPPING, MACHINE_MASTER])('does not expose upload outside D7 scope: $label', (definition) => {
    const { dialog } = open(definition);
    expect(within(dialog).queryByRole('button', { name: /Upload/ })).not.toBeInTheDocument();
    expect(dialog.querySelector('input[type="file"]')).not.toBeInTheDocument();
    cleanup();
  });

  it('shows the exact reader-failure message for a malformed spreadsheet', async () => {
    const read = vi.spyOn(FileReader.prototype, 'readAsArrayBuffer').mockImplementation(function fail(this: FileReader) {
      Object.defineProperty(this, 'error', { configurable: true, value: new DOMException('Unreadable') });
      this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>);
    });
    const user = userEvent.setup();
    const { dialog } = open(PROJECT_CATEGORY_MASTER);
    const file = new File([], 'broken.xlsx');
    await user.upload(fileInput(dialog), file);
    expect(await within(dialog).findByTestId('bulk-import-note')).toHaveTextContent('That file could not be read.');
    read.mockRestore();
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
