import { describe, expect, it } from 'vitest';

import { captionedFiles } from './captionedFiles';

describe('captionedFiles', () => {
  it.each([
    [[], true],
    [[{ caption: 'Context', name: 'one.pdf' }], true],
    [[{ caption: '', name: 'one.pdf' }], false],
    [[{ caption: '   ', name: 'one.pdf' }], false],
    [
      [
        { caption: 'One', name: 'one.pdf' },
        { caption: 'Two', name: 'two.pdf' },
      ],
      true,
    ],
    [
      [
        { caption: 'One', name: 'one.pdf' },
        { caption: '', name: 'two.pdf' },
      ],
      false,
    ],
  ])('returns %s for the supplied files', (files, expected) => {
    expect(captionedFiles(files)).toBe(expected);
  });
});
