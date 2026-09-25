import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  CSV_MIME,
  EXCEL_MIME,
  RecordExport,
  recordExportFilename,
} from './RecordExport';
import fixture from '../../../scripts/golden/m3.1-overtime-csv.fixture.json';
import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
beforeEach(() => {
  vi.restoreAllMocks();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const definition = {
  columns: ['A', 'B'],
  label: 'Job Orders',
  rows: [['1', 'Two']],
} as const;

describe('RecordExport', () => {
  it('preserves CSV and Excel MIME types and filenames', async () => {
    const createUrl = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function captureDownload(this: HTMLAnchorElement) {
        downloads.push(this.download);
      },
    );
    const user = userEvent.setup();
    render(<RecordExport definition={definition} kind="task" />);

    await user.click(screen.getByRole('button', { name: /Export/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Excel spreadsheet' }));
    const excelBlob = createUrl.mock.calls[0]?.[0];
    expect(excelBlob).toBeInstanceOf(Blob);
    expect((excelBlob as Blob).type).toBe(EXCEL_MIME);
    expect(downloads[0]).toBe('job-orders-export.xls');
    expect(recordExportFilename('Job Orders', 'xls', 'export')).toBe(
      'job-orders-export.xls',
    );

    await user.click(screen.getByRole('button', { name: /Export/ }));
    await user.click(screen.getByRole('menuitem', { name: 'CSV file' }));
    expect((createUrl.mock.calls[1]?.[0] as Blob).type).toBe(CSV_MIME);
    expect(downloads[1]).toBe('job-orders-export.csv');
    expect(recordExportFilename('Job Orders', 'csv', 'export')).toBe(
      'job-orders-export.csv',
    );
    expect(recordExportFilename('Overtime', 'csv', 'report')).toBe(
      fixture.filename,
    );
  });

  it('calls window.print for both PDF and Print', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<RecordExport definition={definition} kind="task" />);

    await user.click(screen.getByRole('button', { name: /Export/ }));
    await user.click(screen.getByRole('menuitem', { name: 'PDF document' }));
    await vi.advanceTimersByTimeAsync(400);
    expect(print).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /Export/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Print' }));
    await vi.advanceTimersByTimeAsync(400);
    expect(print).toHaveBeenCalledTimes(2);
  });
});
