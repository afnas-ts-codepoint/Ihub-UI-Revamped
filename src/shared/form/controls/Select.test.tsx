import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { Select } from '@/shared/form/controls/Select';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(cleanup);

function SelectHarness() {
  const [value, setValue] = useState('');
  return (
    <Select
      ariaLabel="Owner"
      onChange={setValue}
      options={[
        { label: 'Operations', value: 'operations' },
        { label: 'Facilities', value: 'facilities' },
        { label: 'Finance', value: 'finance' },
      ]}
      placeholder="Any"
      value={value}
    />
  );
}

describe('Select', () => {
  it('searches and supports Arrow Up, Arrow Down, Enter, Escape, and selected state', async () => {
    const user = userEvent.setup();
    render(<SelectHarness />);
    const input = screen.getByRole('combobox', { name: 'Owner' });

    await user.click(input);
    await user.keyboard('{ArrowDown}{ArrowUp}{Enter}');
    expect(input).toHaveValue('Operations');

    await user.click(input);
    await user.type(input, 'fac');
    expect(screen.getByRole('option', { name: 'Facilities' })).toBeVisible();
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('Facilities');

    await user.click(input);
    await user.clear(input);
    await user.type(input, 'missing');
    expect(screen.getByText('No matches')).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('localizes the empty state in Arabic', async () => {
    await i18n.changeLanguage('ar');
    const user = userEvent.setup();
    render(<SelectHarness />);
    const input = screen.getByRole('combobox', { name: 'Owner' });
    await user.click(input);
    await user.type(input, 'missing');
    expect(screen.getByText('لا نتائج')).toBeVisible();
    await i18n.changeLanguage('en');
  });
});
