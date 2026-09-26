import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';
afterEach(cleanup);
describe('ProgressBar', () => {
  it('renders accessible bounded values and a logical marker', () => {
    render(<ProgressBar label="Time used" markerValue={125} value={140} />);
    expect(
      screen.getByRole('progressbar', { name: 'Time used' }),
    ).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByTestId('progress-indicator')).toHaveStyle({
      width: '100%',
    });
    expect(screen.getByTestId('progress-marker')).toHaveStyle({
      insetInlineStart: 'calc(100% - 1px)',
    });
  });
  it('bounds negative values at zero', () => {
    render(<ProgressBar label="Empty" value={-5} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });
});
