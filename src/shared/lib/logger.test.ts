import { afterEach, describe, expect, it, vi } from 'vitest';

import { logger, rootErrorHandlers } from '@/shared/lib/logger';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('React root error hooks', () => {
  it('sends caught and uncaught errors to the logger', () => {
    const log = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    const caught = new Error('caught');
    const uncaught = new Error('uncaught');

    rootErrorHandlers.onCaughtError(caught, { componentStack: 'caught stack' });
    rootErrorHandlers.onUncaughtError(uncaught, {
      componentStack: 'uncaught stack',
    });

    expect(log).toHaveBeenNthCalledWith(1, 'React caught error', caught, {
      componentStack: 'caught stack',
    });
    expect(log).toHaveBeenNthCalledWith(2, 'React uncaught error', uncaught, {
      componentStack: 'uncaught stack',
    });
  });
});
