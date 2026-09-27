import { utils, write } from 'xlsx';
import { describe, expect, it } from 'vitest';

import { isSpreadsheetFilename, readFile } from './readFile';

function workbookFile(bookType: 'xls' | 'xlsx') {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([
    ['Name', 'Ignored'],
    ['Alpha', 'Extra'],
    ['Beta'],
  ]), 'Names');
  const bytes = write(workbook, { bookType, type: 'array' }) as ArrayBuffer;
  return new File([bytes], `names.${bookType}`);
}

describe('readFile', () => {
  it.each(['names.xlsx', 'names.XLS', 'names.xlsm', 'names.xlsb'])('recognizes prototype spreadsheet extension %s', (filename) => {
    expect(isSpreadsheetFilename(filename)).toBe(true);
  });

  it.each(['names.csv', 'names.txt', 'names.xlsx.csv'])('routes %s through text reading', (filename) => {
    expect(isSpreadsheetFilename(filename)).toBe(false);
  });

  it('reads CSV as raw text without loading spreadsheet parsing', async () => {
    await expect(readFile(new File(['Name\r\nAlpha'], 'names.csv'))).resolves.toEqual({
      kind: 'text',
      text: 'Name\r\nAlpha',
    });
  });

  it.each(['xlsx', 'xls'] as const)('reads the first %s worksheet as a row grid', async (bookType) => {
    const result = await readFile(workbookFile(bookType));
    expect(result).toEqual({
      kind: 'spreadsheet',
      rows: [['Name', 'Ignored'], ['Alpha', 'Extra'], ['Beta']],
    });
  });
});
