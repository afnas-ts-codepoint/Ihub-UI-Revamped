import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  createEmptyRecordFilter,
  recordFilterKinds,
  type RecordFilterKind,
  type RecordFilterValue,
} from './filter.types';
import { RecordFilter } from './RecordFilter';
import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function FilterHarness({ kind = 'task' }: { kind?: RecordFilterKind }) {
  const [value, setValue] = useState<RecordFilterValue>(
    createEmptyRecordFilter,
  );
  return (
    <RecordFilter
      kind={kind}
      noExport
      onChange={setValue}
      value={value}
    />
  );
}

const numberLabels: Record<RecordFilterKind, string> = {
  incident: 'Incident number',
  task: 'Task number',
  sheet: 'Action sheet number',
  observation: 'Observation number',
  enquiry: 'Enquiry number',
  budget: 'Budget number',
  history: 'Reference number',
  request: 'Request number',
};

describe('RecordFilter', () => {
  it.each(recordFilterKinds)('renders every %s filter kind', async (kind) => {
    const user = userEvent.setup();
    const view = render(<FilterHarness kind={kind} />);
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(
      screen.getByText(`Subject / ${numberLabels[kind]}`),
    ).toBeInTheDocument();
    view.unmount();
  });

  it('applies quick flags and multi-selects, renders removable chips, and clears all', async () => {
    const user = userEvent.setup();
    render(<FilterHarness />);
    const search = screen.getByPlaceholderText(/TSK-2026-318/);
    await user.type(search, 'TSK-1');
    await user.click(screen.getByRole('button', { name: /Filters/ }));
    await user.click(
      screen.getByRole('button', { name: 'Showstoppers only' }),
    );
    await user.click(screen.getByRole('button', { name: 'Assignee' }));
    await user.click(
      screen.getByRole('checkbox', { name: 'A. Al-Rashid' }),
    );
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));

    expect(screen.getByText('TSK-1')).toBeInTheDocument();
    expect(screen.getByText('Showstoppers only')).toBeInTheDocument();
    expect(screen.getByText('A. Al-Rashid')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Remove filter: TSK-1' }),
    );
    expect(screen.queryByText('TSK-1')).not.toBeInTheDocument();

    const clearButtons = screen.getAllByRole('button', { name: 'Clear all' });
    await user.click(clearButtons[0] ?? document.body);
    expect(screen.queryByText('Showstoppers only')).not.toBeInTheDocument();
    expect(screen.queryByText('A. Al-Rashid')).not.toBeInTheDocument();
  });

  it('links From and To date constraints without auto-correcting values', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 8, 25, 10));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FilterHarness />);
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'From' }));
    await user.click(screen.getByRole('button', { name: '2026-09-20' }));
    await user.click(within(dialog).getByRole('button', { name: 'To' }));
    expect(screen.getByRole('button', { name: '2026-09-19' })).toBeDisabled();
  });
});
