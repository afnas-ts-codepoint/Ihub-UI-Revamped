import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { AppErrorBoundary } from '@/app/AppErrorBoundary';
import { initializeI18n } from '@/shared/i18n/i18n';

function CatastrophicFailure(): never {
  throw new Error('controlled catastrophic failure');
}

beforeAll(async () => {
  await initializeI18n('en');
});

describe('AppErrorBoundary', () => {
  it('renders the catastrophic fallback and invokes reload', () => {
    const reload = vi.fn();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    render(
      <AppErrorBoundary onReload={reload}>
        <CatastrophicFailure />
      </AppErrorBoundary>,
    );

    expect(
      screen.getByRole('heading', {
        name: 'The application could not continue',
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reload page' }));
    expect(reload).toHaveBeenCalledOnce();

    consoleError.mockRestore();
  });
});
