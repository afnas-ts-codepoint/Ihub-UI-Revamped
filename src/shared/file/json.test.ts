import { describe, expect, it } from 'vitest';

import { parseJson, toJson } from '@/shared/file/json';

describe('shared/file/json', () => {
  it('parses valid JSON', () => {
    const result = parseJson<{ a: number }>('{"a": 1}');
    expect(result).toEqual({ ok: true, value: { a: 1 } });
  });

  it('reports failure instead of throwing on invalid JSON', () => {
    expect(parseJson('not json')).toEqual({ ok: false });
  });

  it('pretty-prints with 2-space indentation', () => {
    expect(toJson({ a: 1 })).toBe('{\n  "a": 1\n}');
  });
});
