import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { TabbedTable, type TableColumn } from './TabbedTable';

type Row = Readonly<{ name: string }>;

const columns: readonly TableColumn<Row>[] = [{ key: 'name', label: 'Name' }];
const labels = {
  next: 'Next page',
  page: 'Page',
  previous: 'Previous page',
  summary: 'Showing 1 of 1 records',
};

afterEach(cleanup);

describe('TabbedTable', () => {
  it('switches the active tab without changing the supplied rows', async () => {
    const user = userEvent.setup();
    render(
      <TabbedTable
        columns={columns}
        emptyDescription="Nothing matches."
        emptyTitle="Nothing here"
        paginationLabels={labels}
        rows={[{ name: 'Prototype row' }]}
        tabs={[
          { id: 'first', label: 'First', count: 1 },
          { id: 'second', label: 'Second', count: 0 },
        ]}
      />,
    );

    await user.click(screen.getByRole('tab', { name: 'Second 0' }));
    expect(screen.getByRole('tab', { name: 'Second 0' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Prototype row')).toBeVisible();
  });

  it('renders the reusable empty state', () => {
    render(
      <TabbedTable
        columns={columns}
        emptyDescription="Nothing matches."
        emptyTitle="Nothing here"
        paginationLabels={{ ...labels, summary: 'Showing 0 of 0 records' }}
        rows={[]}
        tabs={[{ id: 'all', label: 'All', count: 0 }]}
      />,
    );

    expect(screen.getByText('Nothing here')).toBeVisible();
    expect(screen.getByText('Nothing matches.')).toBeVisible();
  });

  it('keeps prototype pagination intentionally inert', async () => {
    const user = userEvent.setup();
    render(
      <TabbedTable
        columns={columns}
        emptyDescription="Nothing matches."
        emptyTitle="Nothing here"
        paginationLabels={labels}
        rows={[{ name: 'Prototype row' }]}
        tabs={[{ id: 'all', label: 'All', count: 1 }]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.click(screen.getByRole('button', { name: 'Page 2' }));

    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByText('Prototype row')).toBeVisible();
  });
});
