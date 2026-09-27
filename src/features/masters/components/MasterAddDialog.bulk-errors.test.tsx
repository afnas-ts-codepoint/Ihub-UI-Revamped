import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { MasterAddDialog } from './MasterAddDialog';
import { PROJECT_CATEGORY_MASTER } from '../domain/definitions';
import { readFile } from '@/shared/file/readFile';
import { SpreadsheetReaderLoadError } from '@/shared/file/xlsx';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

vi.mock('@/shared/file/readFile', () => ({ readFile: vi.fn() }));

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  vi.resetAllMocks();
  await i18n.changeLanguage('en');
});

function open() {
  render(<MasterAddDialog definition={PROJECT_CATEGORY_MASTER} onClose={vi.fn()} title="Project Category Master" />);
  const dialog = screen.getByTestId('master-add-dialog');
  const input = dialog.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('Expected bulk-import file input');
  return { dialog, input };
}

describe('MasterAddDialog bulk error messages', () => {
  it('shows the exact spreadsheet-reader load failure text', async () => {
    vi.mocked(readFile).mockRejectedValue(new SpreadsheetReaderLoadError(new Error('chunk failed')));
    const user = userEvent.setup();
    const { dialog, input } = open();

    await user.upload(input, new File(['x'], 'names.xlsx'));

    expect(await within(dialog).findByTestId('bulk-import-note')).toHaveTextContent(
      'The spreadsheet reader did not load — refresh the page and try again.',
    );
  });

  it('shows the exact generic reader failure text in Arabic', async () => {
    await i18n.changeLanguage('ar');
    vi.mocked(readFile).mockRejectedValue(new Error('parse failed'));
    const user = userEvent.setup();
    const { dialog, input } = open();

    await user.upload(input, new File(['x'], 'names.csv'));

    expect(await within(dialog).findByTestId('bulk-import-note')).toHaveTextContent(
      'تعذّرت قراءة الملف.',
    );
  });
});
