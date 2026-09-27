import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProgressRing } from './ProgressRing';

describe('ProgressRing', () => {
  it('clamps progress semantics and renders its label', () => {
    const { rerender } = render(<ProgressRing label="82%" value={0.82} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '82',
    );
    expect(screen.getByText('82%')).toBeVisible();

    rerender(<ProgressRing value={2} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });
});
