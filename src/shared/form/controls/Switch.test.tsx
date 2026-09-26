import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Switch } from './Switch';

describe('Switch', () => {
  it.each([
    [true, 'checked'],
    [false, 'unchecked'],
  ] as const)('renders the %s decorative state', (checked, state) => {
    const { container } = render(<Switch checked={checked} />);
    const control = container.querySelector('[data-state]');
    expect(control).toHaveAttribute('data-state', state);
    expect(control).not.toHaveAttribute('tabindex');
  });
});
