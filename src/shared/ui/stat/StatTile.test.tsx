import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { StatTile } from './StatTile';

afterEach(cleanup);

describe('StatTile', () => {
  it('renders the label, value, and supporting text', () => {
    render(
      <StatTile
        label="Budgeted (Apr)"
        sub="Allocation across all malls"
        value="KWD 18,500"
      />,
    );

    expect(screen.getByText('Budgeted (Apr)')).toBeVisible();
    expect(screen.getByText('KWD 18,500')).toBeVisible();
    expect(screen.getByText('Allocation across all malls')).toBeVisible();
  });

  it('omits supporting text when not provided', () => {
    render(<StatTile label="Actual MTD" value="KWD 14,820" />);

    expect(screen.getByText('Actual MTD')).toBeVisible();
    expect(screen.queryByText('80% utilised')).toBeNull();
  });

  it.each([
    ['ok' as const, 'text-ok'],
    ['bad' as const, 'text-bad'],
    ['neutral' as const, 'text-fg'],
  ])('applies the %s tone to the value', (tone, className) => {
    render(<StatTile label="Budget Variance" tone={tone} value="+KWD 1,240" />);

    expect(screen.getByText('+KWD 1,240')).toHaveClass(className);
  });
});
