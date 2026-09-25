import { describe, expect, it } from 'vitest';

import { cn } from '@/shared/lib/cn';

describe('cn', () => {
  it('preserves project color and type classes from different groups', () => {
    expect(cn('text-fg-2', 'text-sm')).toBe('text-fg-2 text-sm');
  });

  it('merges project color, radius, shadow, and type scales', () => {
    expect(cn('bg-canvas', 'bg-surface')).toBe('bg-surface');
    expect(cn('rounded-compact', 'rounded-dialog')).toBe('rounded-dialog');
    expect(cn('shadow-menu', 'shadow-drawer')).toBe('shadow-drawer');
    expect(cn('text-sm', 'text-md')).toBe('text-md');
  });

  it('handles conditional class inputs', () => {
    expect(cn('bg-canvas', false, ['text-fg', { 'font-ui': true }])).toBe(
      'bg-canvas text-fg font-ui',
    );
  });
});
