import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BarChart, barHeightPercentage } from './BarChart';

describe('BarChart', () => {
  it('normalizes bar heights against the largest value', () => {
    expect(barHeightPercentage(50, 200)).toBe(25);
    expect(barHeightPercentage(200, 200)).toBe(100);
    expect(barHeightPercentage(1, 0)).toBe(0);
  });

  it('renders deterministic labels, values, colors, and dimensions', () => {
    const { container } = render(
      <BarChart
        ariaLabel="Budget chart"
        data={[
          { label: 'J', value: 25 },
          { label: 'F', value: 100 },
        ]}
        height={200}
      />,
    );

    expect(screen.getByRole('img', { name: 'Budget chart' })).toBeVisible();
    expect(screen.getByText('J')).toBeVisible();
    expect(screen.getByText('F')).toBeVisible();
    expect(container.querySelector('.budget-chart-bars')).toHaveStyle({
      '--chart-container-height': '200px',
    });
    const bars = container.querySelectorAll('.budget-chart-bar');
    expect(bars).toHaveLength(2);
    expect(bars[0]).toHaveStyle({
      '--chart-bar-color': 'var(--brand-purple)',
      '--chart-bar-height': '25%',
    });
    expect(bars[1]).toHaveStyle({
      '--chart-bar-color': 'var(--brand-indigo)',
      '--chart-bar-height': '100%',
    });
  });
});
