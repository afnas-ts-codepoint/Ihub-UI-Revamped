import { describe, expect, it } from 'vitest';

import { durMins, fmtTotal } from './duration';

describe('prototype workflow duration rules', () => {
  it.each([
    ['—', 0],
    ['5m', 5],
    ['30m', 30],
    ['1h', 60],
    ['2h', 120],
    ['1d', 480],
    ['5d', 2_400],
  ] as const)('converts %s to %i minutes', (duration, minutes) => {
    expect(durMins(duration)).toBe(minutes);
  });

  it.each([
    [0, '—'],
    [55, '55 m'],
    [60, '1 h'],
    [135, '2.3 h'],
    [480, '1 d'],
    [570, '1.2 d'],
    [2_400, '5 d'],
  ] as const)('formats %i minutes as %s', (minutes, total) => {
    expect(fmtTotal(minutes)).toBe(total);
  });
});
