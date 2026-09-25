import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { DateField } from '@/shared/form/controls/DateField';
import { DateRangeField } from '@/shared/form/controls/DateRangeField';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function DateHarness({ max, min }: { max?: string; min?: string }) {
  const [value, setValue] = useState('');
  return (
    <DateField
      ariaLabel="Date"
      max={max}
      min={min}
      onChange={setValue}
      value={value}
    />
  );
}

function RangeHarness() {
  const [value, setValue] = useState({ from: '2026-09-20', to: '' });
  return <DateRangeField onChange={setValue} value={value} />;
}

describe('DateField', () => {
  it('selects valid dates, Today, and Clear', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 8, 25, 10));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DateHarness />);
    await user.click(screen.getByRole('button', { name: 'Date' }));
    await user.click(screen.getByRole('button', { name: '2026-09-18' }));
    expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent(
      '18 Sep 2026',
    );
    await user.click(screen.getByRole('button', { name: 'Date' }));
    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent(
      '25 Sep 2026',
    );
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent(
      'Any date',
    );
  });

  it('disables dates outside min/max and links a date range', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 8, 25, 10));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const first = render(<DateHarness min="2026-09-20" max="2026-09-27" />);
    await user.click(screen.getByRole('button', { name: 'Date' }));
    expect(screen.getByRole('button', { name: '2026-09-19' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '2026-09-28' })).toBeDisabled();
    first.unmount();

    render(<RangeHarness />);
    await user.click(screen.getByRole('button', { name: 'To' }));
    expect(screen.getByRole('button', { name: '2026-09-19' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '2026-09-20' })).toBeEnabled();
  });

  it('uses explicit Arabic labels, Western digits, and RTL document direction', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 8, 25, 10));
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DateHarness />);
    await user.click(screen.getByRole('button', { name: 'Date' }));
    expect(screen.getByText('سبتمبر 2026')).toBeVisible();
    for (const weekday of ['أح', 'إن', 'ذل', 'رب', 'خم', 'جم', 'سب']) {
      expect(screen.getByText(weekday)).toBeVisible();
    }
    expect(screen.getByText('سبتمبر 2026').textContent).not.toMatch(/[٠-٩]/);
    expect(document.documentElement.dir).toBe('rtl');
    document.documentElement.dir = 'ltr';
    await i18n.changeLanguage('en');
  });
});
