import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { SegmentedRadio } from './SegmentedRadio';
import { SwatchRadio } from './SwatchRadio';

afterEach(cleanup);

const choices = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
] as const;

function SegmentedHarness() {
  const [value, setValue] = useState('medium');
  return <SegmentedRadio ariaLabel="Priority" name="priority" onChange={setValue} options={choices} value={value} />;
}

function SwatchHarness() {
  const [value, setValue] = useState('');
  return <SwatchRadio ariaLabel="Severity" onChange={setValue} options={choices.map((choice) => ({ ...choice, colorClass: 'bg-ok' }))} value={value} />;
}

describe('master choice controls', () => {
  it('exposes a labelled native radio group and keyboard selection for priority', async () => {
    const user = userEvent.setup();
    render(<SegmentedHarness />);

    const medium = screen.getByRole('radio', { name: 'Medium' });
    expect(medium).toBeChecked();
    medium.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'High' })).toBeChecked();
  });

  it('labels severity beyond color and supports roving arrow-key selection', async () => {
    const user = userEvent.setup();
    render(<SwatchHarness />);

    const group = screen.getByRole('radiogroup', { name: 'Severity' });
    const low = within(group).getByRole('radio', { name: 'Low' });
    expect(low).toHaveAttribute('tabindex', '0');
    low.focus();
    await user.keyboard('{ArrowRight}');
    expect(within(group).getByRole('radio', { name: 'Medium' })).toHaveAttribute('aria-checked', 'true');
    expect(within(group).getByRole('radio', { name: 'Medium' })).toHaveFocus();
  });
});
