import { describe, expect, it } from 'vitest';

import { scoreBand } from './scoreBand';

describe('scoreBand', () => {
  it.each([
    [2.9, 'bad'],
    [3, 'neutral'],
    [3.8, 'neutral'],
    [4, 'ok'],
    [4.6, 'ok'],
  ] as const)('maps %s to %s', (score, expected) => {
    expect(scoreBand(score)).toBe(expected);
  });
});
