import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { MultiSelectChips } from '@/shared/form/controls/MultiSelectChips';
import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(() => {
  cleanup();
  document.documentElement.dir = 'ltr';
});

function Harness() {
  const [value, setValue] = useState<readonly string[]>([]);
  return (
    <MultiSelectChips
      ariaLabel="Assignee"
      onChange={setValue}
      options={[
        { label: 'A. Al-Rashid', value: 'rashid' },
        { label: 'N. Saleh', value: 'saleh' },
      ]}
      value={value}
    />
  );
}

describe('MultiSelectChips', () => {
  it('selects with accessible controls, renders removable chips, and restores focus', async () => {
    document.documentElement.dir = 'rtl';
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Assignee' });

    await user.click(trigger);
    const search = screen.getByRole('textbox', { name: 'Search options' });
    expect(search).toHaveFocus();
    await user.type(search, 'rashid');
    await user.click(screen.getByRole('checkbox', { name: 'A. Al-Rashid' }));
    expect(
      screen.getByRole('button', { name: 'Remove A. Al-Rashid' }),
    ).toBeVisible();

    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
    await user.click(
      screen.getByRole('button', { name: 'Remove A. Al-Rashid' }),
    );
    expect(screen.queryByText('A. Al-Rashid')).not.toBeInTheDocument();
  });
});
