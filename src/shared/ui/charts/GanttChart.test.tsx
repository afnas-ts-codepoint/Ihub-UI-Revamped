import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { GanttChart } from './GanttChart';

afterEach(cleanup);

describe('GanttChart', () => {
  it('renders one column header per column and one bar per row', () => {
    render(
      <GanttChart
        columns={[
          { primary: 'Feb 5', secondary: 'Day 1' },
          { primary: 'Feb 6', secondary: 'Day 2' },
        ]}
        rowHeaderLabel="Sub Task"
        rows={[
          {
            badge: '10%',
            bar: { end: 1, label: 'Initial Assessment', start: 0, tone: 'var(--warn)' },
            id: 'r1',
            meta: 'Tom Baker',
            title: 'Initial Assessment',
          },
        ]}
      />,
    );
    expect(screen.getByText('Feb 5')).toBeVisible();
    expect(screen.getByText('Feb 6')).toBeVisible();
    expect(screen.getByText('Tom Baker')).toBeVisible();
    expect(screen.getByTestId('gantt-bar')).toHaveStyle({ width: '100%' });
  });
});
