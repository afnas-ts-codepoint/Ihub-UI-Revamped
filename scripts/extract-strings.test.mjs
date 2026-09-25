import { describe, expect, it } from 'vitest';

import { extractTranslationPairs } from './extract-strings.mjs';

describe('extractTranslationPairs', () => {
  it('reproduces a requested sample range verbatim', () => {
    const source = [
      "const outside = T('Skip', 'تخط', locale);",
      "const greeting = T('Hello', 'مرحبا', locale);",
      `const owner = T("Owner's task", "مهمة المالك", locale);`,
    ].join('\n');

    expect(extractTranslationPairs(source, 2, 3)).toEqual({
      ar: {
        draft: {
          line2Item1: 'مرحبا',
          line3Item2: 'مهمة المالك',
        },
      },
      en: {
        draft: {
          line2Item1: 'Hello',
          line3Item2: "Owner's task",
        },
      },
    });
  });
});
