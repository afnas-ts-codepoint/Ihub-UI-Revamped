export class SpreadsheetReaderLoadError extends Error {
  constructor(cause: unknown) {
    super('Spreadsheet reader failed to load', { cause });
    this.name = 'SpreadsheetReaderLoadError';
  }
}

/**
 * Read the first worksheet into a simple row grid. SheetJS is intentionally
 * imported inside the upload call so it never enters the initial app bundle.
 */
export async function readSpreadsheet(data: ArrayBuffer): Promise<unknown[][]> {
  let sheetJs: typeof import('xlsx');

  try {
    sheetJs = await import('xlsx');
  } catch (error) {
    throw new SpreadsheetReaderLoadError(error);
  }

  const workbook = sheetJs.read(new Uint8Array(data), { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) throw new Error('Workbook has no worksheets');

  const firstSheet = workbook.Sheets[firstSheetName];

  if (!firstSheet) throw new Error('Workbook first worksheet is missing');

  return sheetJs.utils.sheet_to_json<unknown[]>(firstSheet, {
    blankrows: false,
    header: 1,
  });
}
