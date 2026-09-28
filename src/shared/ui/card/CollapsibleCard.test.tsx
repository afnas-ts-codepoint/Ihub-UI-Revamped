import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CollapsibleCard } from './CollapsibleCard';

describe('CollapsibleCard', () => {
  it('renders controlled content and requests independent state changes from its header', async () => {
    const content = 'Fields';
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<CollapsibleCard onOpenChange={onOpenChange} open title="Supplier A"><div>{content}</div></CollapsibleCard>);
    expect(screen.getByText(content)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Supplier A' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(<CollapsibleCard onOpenChange={onOpenChange} open={false} title="Supplier A"><div>{content}</div></CollapsibleCard>);
    expect(screen.queryByText(content)).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Supplier A' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });
});
