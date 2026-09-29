import { describe, expect, it } from 'vitest';

import {
  addWorkdays,
  isWeekend,
  parseFlexibleDate,
  toUsDate,
  workdaysBetween,
} from './workdays';

describe('isWeekend', () => {
  it('treats Friday and Saturday as the weekend', () => {
    expect(isWeekend(new Date(2026, 8, 25))).toBe(true); // Friday
    expect(isWeekend(new Date(2026, 8, 26))).toBe(true); // Saturday
  });

  it('treats Sunday through Thursday as working days', () => {
    for (const day of [27, 28, 29, 30, 24]) {
      expect(isWeekend(new Date(2026, 8, day))).toBe(false);
    }
  });
});

describe('addWorkdays', () => {
  it('skips Friday and Saturday when counting forward', () => {
    // Wed 2026-09-23 + 3 working days -> Thu(24) Sun(27) Mon(28) => Mon 28 Sep
    const result = addWorkdays(new Date(2026, 8, 23), 3);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(8);
    expect(result.getDate()).toBe(28);
  });
});

describe('workdaysBetween', () => {
  it('is positive for a future date, counting only working days', () => {
    expect(workdaysBetween(new Date(2026, 8, 23), new Date(2026, 8, 28))).toBe(3);
  });

  it('is negative (days overdue) for a past date', () => {
    expect(workdaysBetween(new Date(2026, 8, 28), new Date(2026, 8, 23))).toBe(-5);
  });

  it('is zero for the same day', () => {
    expect(workdaysBetween(new Date(2026, 8, 23), new Date(2026, 8, 23))).toBe(0);
  });
});

describe('parseFlexibleDate', () => {
  it('parses ISO yyyy-mm-dd', () => {
    const date = parseFlexibleDate('2026-09-25');
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(25);
  });

  it('parses legacy MM/DD/YYYY', () => {
    const date = parseFlexibleDate('09/25/2026');
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(25);
  });

  it('returns null for empty or unparseable input', () => {
    expect(parseFlexibleDate('')).toBeNull();
    expect(parseFlexibleDate(null)).toBeNull();
    expect(parseFlexibleDate('not a date')).toBeNull();
  });
});

describe('toUsDate', () => {
  it('formats as MM/DD/YYYY', () => {
    expect(toUsDate(new Date(2026, 8, 5))).toBe('09/05/2026');
  });
});
