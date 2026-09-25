import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { initializeI18n } from '@/shared/i18n/i18n';
import { MigrationPending } from '@/shared/ui/feedback/MigrationPending';

beforeAll(async () => {
  await initializeI18n('en');
});

describe('feedback foundations', () => {
  it('makes a pending migration distinct and explicit', () => {
    render(<MigrationPending area="Example area" />);

    expect(screen.getByRole('status')).toHaveAttribute(
      'data-migration-pending',
      'Example area',
    );
    expect(screen.getByText('Migration pending')).toBeInTheDocument();
  });
});
