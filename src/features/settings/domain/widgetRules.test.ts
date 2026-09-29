import { describe, expect, it } from 'vitest';

import {
  clearWidgetIds,
  reorderWidgetIds,
  selectAllWidgetIds,
  toggleWidgetId,
} from './widgetRules';

describe('toggleWidgetId', () => {
  it('turns a widget on when under the max', () => {
    expect(
      toggleWidgetId(['a', 'b'], 'c', { hideDisallowed: false, locked: [] }),
    ).toEqual({ ids: ['a', 'b', 'c'], ok: true });
  });

  it('blocks turning a widget on at the max', () => {
    const ids = Array.from({ length: 15 }, (_, index) => `w${String(index)}`);
    expect(
      toggleWidgetId(ids, 'new', { hideDisallowed: false, locked: [] }),
    ).toEqual({ ok: false, reason: 'max-reached' });
  });

  it('turns a widget off when hiding is allowed and it is not locked', () => {
    expect(
      toggleWidgetId(['a', 'b'], 'a', { hideDisallowed: false, locked: [] }),
    ).toEqual({ ids: ['b'], ok: true });
  });

  it('blocks hiding when the personal/admin rules disallow it', () => {
    expect(
      toggleWidgetId(['a', 'b'], 'a', { hideDisallowed: true, locked: [] }),
    ).toEqual({ ok: false, reason: 'hide-disallowed' });
  });

  it('blocks hiding a locked/mandatory widget even when hiding is otherwise allowed', () => {
    expect(
      toggleWidgetId(['metrics', 'b'], 'metrics', {
        hideDisallowed: false,
        locked: ['metrics'],
      }),
    ).toEqual({ ok: false, reason: 'locked' });
  });
});

describe('reorderWidgetIds', () => {
  it('moves a widget before the drop target', () => {
    expect(reorderWidgetIds(['a', 'b', 'c'], 'c', 'a', true)).toEqual([
      'c',
      'a',
      'b',
    ]);
  });

  it('appends to the end when dropped with no target', () => {
    expect(reorderWidgetIds(['a', 'b', 'c'], 'a', null, true)).toEqual([
      'b',
      'c',
      'a',
    ]);
  });

  it('is a no-op when reordering is disallowed', () => {
    expect(reorderWidgetIds(['a', 'b', 'c'], 'c', 'a', false)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('is a no-op when dropped on itself or with no drag source', () => {
    expect(reorderWidgetIds(['a', 'b'], 'a', 'a', true)).toEqual(['a', 'b']);
    expect(reorderWidgetIds(['a', 'b'], null, 'a', true)).toEqual(['a', 'b']);
  });
});

describe('selectAllWidgetIds', () => {
  it('appends every not-yet-shown widget, capped at the max', () => {
    expect(
      selectAllWidgetIds(['a'], ['a', 'b', 'c', 'd'], 3),
    ).toEqual(['a', 'b', 'c']);
  });
});

describe('clearWidgetIds', () => {
  it('keeps only the locked/mandatory ids', () => {
    expect(clearWidgetIds(['a', 'b', 'c'], ['b'])).toEqual(['b']);
  });

  it('results in an empty list when nothing is locked', () => {
    expect(clearWidgetIds(['a', 'b'], [])).toEqual([]);
  });
});
