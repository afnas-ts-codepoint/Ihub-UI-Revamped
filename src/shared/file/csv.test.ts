import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';

import fixture from '../../../scripts/golden/m3.1-overtime-csv.fixture.json';
import { csvBytes, toCsv } from '@/shared/file/csv';

const columns = [
  'OT #',
  'Employee',
  'Department',
  'Date',
  'Hours',
  'Amount (KWD)',
  'Status',
] as const;

const rows = [
  ['OT-2451', 'Khaled Ibrahim', 'Operations', '28 Jul 2026', '4.5', '180.000', 'Pending'],
  ['OT-2450', 'Layla Haddad', 'Marketing', '28 Jul 2026', '3.0', '142.500', 'Approved'],
  ['OT-2449', 'Mohammed Al-Otaibi', 'Finance', '27 Jul 2026', '6.0', '320.000', 'Pending'],
  ['OT-2448', 'Sara Al-Qahtani', 'Marketing', '27 Jul 2026', '2.5', '125.000', 'Above budget'],
  ['OT-2447', 'Yousef Al-Mutairi', 'IT & Systems', '26 Jul 2026', '5.0', '210.000', 'Approved'],
] as const;

describe('M3.1 CSV golden parity', () => {
  it('matches the prototype bytes, encoding, line endings, and filename', () => {
    const bytes = csvBytes(columns, rows);

    expect(bytes.byteLength).toBe(fixture.byteLength);
    expect(Buffer.from(bytes).toString('base64')).toBe(fixture.base64);
    expect(toCsv(columns, rows)).not.toContain('\r');
    expect(fixture.mimeType).toBe('text/csv;charset=utf-8');
  });

  it('quotes every cell and doubles embedded quotes exactly', () => {
    expect(toCsv(['A', 'B'], [['one, two', 'say "hello"']])).toBe(
      '"A","B"\n"one, two","say ""hello"""',
    );
  });
});
