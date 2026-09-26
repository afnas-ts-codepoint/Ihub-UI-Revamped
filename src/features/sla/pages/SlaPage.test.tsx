import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SlaPage } from './SlaPage';
import arSla from '@/shared/i18n/locales/ar/sla.json';
import enSla from '@/shared/i18n/locales/en/sla.json';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

describe('SlaPage', () => {
  it('renders the actual prototype Overview hierarchy without the dead clock card', () => {
    render(<SlaPage />);
    expect(
      screen.getByRole('heading', { name: 'SLA & Compliance' }),
    ).toBeVisible();
    expect(screen.getByText('316')).toBeVisible();
    expect(screen.getByText('295')).toBeVisible();
    expect(screen.getByText('93.4% overall')).toBeVisible();
    expect(screen.getAllByRole('columnheader')).toHaveLength(8);
    expect(screen.getByText('Quality assurance')).toBeVisible();
    expect(
      screen.getByRole('heading', { name: enSla.framework.title }),
    ).toBeVisible();
    expect(screen.queryByText('The SLA clock')).not.toBeInTheDocument();
  });

  it('opens department and item drill-ins with the inert preview and bounded time-used progress', async () => {
    const user = userEvent.setup();
    render(<SlaPage />);
    const row = screen.getByText('Facility maintenance').closest('tr');
    if (!row) throw new Error('Expected department row');
    await user.click(row);
    const departmentDialog = screen.getByTestId('department-dialog');
    expect(
      within(departmentDialog).getAllByText('Mansour Al-Rashed', {
        exact: false,
      }),
    ).not.toHaveLength(0);
    await user.click(
      within(departmentDialog).getByText('Blocked drain — Zone C restrooms'),
    );
    const itemDialog = screen.getByTestId('sla-item-dialog');
    expect(within(itemDialog).getByText('400%')).toBeVisible();
    expect(
      itemDialog.querySelector('[data-prototype-noop="item-preview"]'),
    ).toHaveAttribute('inert');
    expect(within(itemDialog).getByText(enSla.item.readOnly)).toBeVisible();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('sla-item-dialog')).not.toBeInTheDocument();
    });
  });

  it('matches Work-area search fields, case behavior, priority filters, and empty state', async () => {
    const user = userEvent.setup();
    render(<SlaPage />);
    await user.click(screen.getByRole('tab', { name: enSla.tabs.mapping }));
    const search = screen.getByRole('textbox', { name: enSla.mapping.search });
    await user.type(search, 'SHATTERED');
    expect(screen.getByText('Glass & Acrylic')).toBeVisible();
    expect(screen.queryByText('Fire Alarm Systems')).not.toBeInTheDocument();
    await user.clear(search);
    await user.type(search, 'Within 15 minutes');
    expect(screen.getByText(enSla.mapping.noMatches)).toBeVisible();
    await user.clear(search);
    await user.click(screen.getByRole('button', { name: enSla.priorities.P4 }));
    expect(screen.getByText('Painting & Decorative Carpentry')).toBeVisible();
    expect(screen.queryByText('Fire Alarm Systems')).not.toBeInTheDocument();
  });

  it('keeps an invalid Area save silent and the dialog open without mutation', async () => {
    const user = userEvent.setup();
    render(<SlaPage />);
    await user.click(screen.getByRole('tab', { name: enSla.tabs.mapping }));
    const mapping = screen.getByTestId('work-area-mapping');
    const originalRows = mapping.querySelectorAll('tbody tr').length;
    await user.click(
      screen.getByRole('button', { name: enSla.actions.add }),
    );
    await user.click(screen.getByRole('button', { name: enSla.actions.add }));
    await waitFor(() => {
      expect(screen.getByTestId('work-area-dialog')).toBeVisible();
    });
    expect(mapping.querySelectorAll('tbody tr')).toHaveLength(originalRows);
    expect(
      screen.queryByText('This field is required'),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('supports valid Add/Edit/Remove and defaults an emptied priority to P3', async () => {
    const user = userEvent.setup();
    render(<SlaPage />);
    await user.click(screen.getByRole('tab', { name: enSla.tabs.mapping }));
    await user.click(
      screen.getByRole('button', { name: enSla.actions.add }),
    );
    const addDialog = await screen.findByTestId('work-area-dialog');
    await user.type(
      within(addDialog).getByRole('textbox', { name: enSla.form.area }),
      'New guest touch point',
    );
    await user.click(
      within(addDialog).getByRole('button', { name: enSla.priorities.P3 }),
    );
    await user.click(
      within(addDialog).getByRole('button', { name: enSla.actions.add }),
    );
    await waitFor(() => {
      expect(screen.queryByTestId('work-area-dialog')).not.toBeInTheDocument();
    });
    const added = screen.getByText('New guest touch point').closest('tr');
    if (!added) throw new Error('Expected added mapping');
    expect(within(added).getByText(enSla.priorities.P3)).toBeVisible();
    await user.click(added);
    const editDialog = await screen.findByTestId('work-area-dialog');
    const area = within(editDialog).getByRole('textbox', {
      name: enSla.form.area,
    });
    await user.clear(area);
    await user.type(area, 'Edited guest touch point');
    await user.click(
      within(editDialog).getByRole('button', { name: enSla.actions.save }),
    );
    expect(await screen.findByText('Edited guest touch point')).toBeVisible();
    await user.click(screen.getByText('Edited guest touch point'));
    await user.click(
      within(await screen.findByTestId('work-area-dialog')).getByRole(
        'button',
        { name: enSla.actions.remove },
      ),
    );
    expect(
      screen.queryByText('Edited guest touch point'),
    ).not.toBeInTheDocument();
  });

  it('renders localized Arabic controls with RTL direction and Western digits', async () => {
    await i18n.changeLanguage('ar');
    render(<SlaPage />);
    expect(
      screen.getByRole('tab', { name: arSla.tabs.overview }),
    ).toBeVisible();
    expect(
      screen.getByText(arSla.overview.overall.replace('{{value}}', '93.4')),
    ).toBeVisible();
    expect(i18n.dir()).toBe('rtl');
  });
});
