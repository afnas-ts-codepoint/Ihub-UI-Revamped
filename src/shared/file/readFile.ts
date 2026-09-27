import { readSpreadsheet } from './xlsx';

export type ReadFileResult =
  | Readonly<{ kind: 'spreadsheet'; rows: unknown[][] }>
  | Readonly<{ kind: 'text'; text: string }>;

export function isSpreadsheetFilename(filename: string) {
  return /\.(xlsx|xlsm|xlsb|xls)$/i.test(filename);
}

function readAsArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => { reject(reader.error ?? new Error('File read failed')); };
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error('File reader returned unexpected data'));
    };
    reader.readAsArrayBuffer(file);
  });
}

function readAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => { reject(reader.error ?? new Error('File read failed')); };
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else if (reader.result === null) resolve('');
      else reject(new Error('File reader returned unexpected data'));
    };
    reader.readAsText(file);
  });
}

/** Read only the two local paths used by the prototype bulk-import flow. */
export async function readFile(file: File): Promise<ReadFileResult> {
  if (isSpreadsheetFilename(file.name)) {
    return { kind: 'spreadsheet', rows: await readSpreadsheet(await readAsArrayBuffer(file)) };
  }

  return { kind: 'text', text: await readAsText(file) };
}
