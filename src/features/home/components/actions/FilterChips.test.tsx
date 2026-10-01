import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FilterChips } from './FilterChips';

afterEach(cleanup);

const options = [
  { count: 10, id: 'all', label: 'All' },
  { count: 0, id: 'empty', label: 'Empty group' },
  { id: 'plain', label: 'No count' },
];

describe('FilterChips', () => {
  it('marks only the active option as pressed', () => {
    render(<FilterChips onChange={vi.fn()} options={options} value="empty" />);
    expect(screen.getByRole('button', { name: /All/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    const active = screen.getByRole('button', { name: /Empty group/ });
    expect(active).toHaveAttribute('aria-pressed', 'true');
    expect(active.className).toContain('bg-accent');
  });

  it('renders a count whenever it is defined, including zero', () => {
    render(<FilterChips onChange={vi.fn()} options={options} value="all" />);
    expect(screen.getByRole('button', { name: /^All\s*10$/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /^Empty group\s*0$/ })).toBeVisible();
    expect(screen.getByRole('button', { name: 'No count' })).toBeVisible();
  });

  it('reports the clicked option id', async () => {
    const onChange = vi.fn();
    render(<FilterChips onChange={onChange} options={options} value="all" />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Empty group/ }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('empty');
  });
});
