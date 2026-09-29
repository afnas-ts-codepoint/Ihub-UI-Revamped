import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { SettingsConfigurationPage } from './SettingsConfigurationPage';
import { useDashboardConfigStore } from '../store/dashboardConfig.store';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));

beforeEach(() => {
  localStorage.clear();
  useDashboardConfigStore.persist.clearStorage();
  useDashboardConfigStore.setState({
    adminConfigsByDashboard: {},
    adminLibraryByDashboard: {},
    lastSelectedAdminDashboard: 'tasks',
    lastSelectedUserDashboard: 'tasks',
    personalConfigByDashboard: {},
    personalLibraryByDashboard: {},
  });
});

afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

function libraryEntryCard(entryName: string): HTMLElement {
  const heading = screen.getByText(entryName);
  const card = heading.closest('div[class*="rounded-lg"]');
  if (!card) throw new Error(`Library entry card for "${entryName}" not found`);
  return card as HTMLElement;
}

describe('SettingsConfigurationPage — two-tab shell', () => {
  it('shows the Admin Configuration tab by default with the scope selector', () => {
    render(<SettingsConfigurationPage />);

    expect(screen.getByRole('heading', { name: 'Configuration' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Admin Configuration' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'User Configuration' })).toBeVisible();
    expect(screen.getByRole('radiogroup', { name: '' })).toBeInTheDocument();
    expect(screen.getByText('Configuration scope')).toBeVisible();
    expect(screen.getByText('Saved configurations')).toBeVisible();
  });

  it('switches to the User Configuration tab, showing "My dashboard" instead of the scope selector', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    await user.click(screen.getByRole('button', { name: 'User Configuration' }));

    expect(screen.getAllByText('My dashboard').length).toBeGreaterThan(0);
    expect(screen.queryByText('Configuration scope')).not.toBeInTheDocument();
    expect(screen.getByText('My saved layouts')).toBeVisible();
  });

  it('switching the dashboard picker changes the widget catalogue shown', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    expect(screen.getAllByText('Task metrics').length).toBeGreaterThan(0);

    const picker = screen.getByRole('combobox', { name: 'Dashboard' });
    await user.click(picker);
    await user.type(picker, 'Home overview');
    await user.keyboard('{Enter}');

    expect((await screen.findAllByText('Daily brief')).length).toBeGreaterThan(0);
    expect(screen.queryByText('Task metrics')).not.toBeInTheDocument();
  });
});

describe('SettingsConfigurationPage — scope switching', () => {
  it('switches between Default, Role, Department and Individual user scopes', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    await user.click(screen.getByRole('radio', { name: /Role-based/ }));
    expect(screen.getByText(/^Role$/)).toBeVisible();

    await user.click(screen.getByRole('radio', { name: /Department \/ team/ }));
    expect(screen.getByRole('button', { name: 'Departments / teams' })).toBeVisible();

    await user.click(screen.getByRole('radio', { name: /Individual user/ }));
    expect(screen.getByRole('button', { name: 'Users' })).toBeVisible();

    await user.click(screen.getByRole('radio', { name: /^Default/ }));
    expect(screen.getByText('Base layout for everyone')).toBeVisible();
  });

  it('blocks Save (only) for Department/User scope with nothing targeted, but still allows editing widgets', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    await user.click(screen.getByRole('radio', { name: /Department \/ team/ }));
    // Remove the pre-selected department chip to leave the scope untargeted.
    const [firstRemoveButton] = screen.getAllByRole('button', { name: /Remove/ });
    if (!firstRemoveButton) throw new Error('remove chip button not found');
    await user.click(firstRemoveButton);

    expect(screen.getByText('Choose at least one department')).toBeVisible();

    // Widgets remain editable while untargeted.
    const complianceCheckbox = screen.getByRole('checkbox', { name: 'SLA compliance' });
    await user.click(complianceCheckbox);
    expect(complianceCheckbox).toHaveAttribute('aria-checked', 'false');

    await user.click(screen.getByRole('button', { name: 'Save configuration' }));
    expect(screen.getByRole('status')).toHaveTextContent('Choose at least one department');
  });
});

describe('SettingsConfigurationPage — widget toggle, lock and hide behavior', () => {
  it('hides and re-shows a non-mandatory widget', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    const checkbox = screen.getByRole('checkbox', { name: 'SLA compliance' });
    expect(checkbox).toHaveAttribute('aria-checked', 'true');

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('reorders widgets via native drag-and-drop when reordering is allowed', () => {
    render(<SettingsConfigurationPage />);

    // Catalogue order is metrics(#1), slaPerf(#2), compliance(#3), ... —
    // dragging "SLA compliance" onto "Task metrics" should move it to #1.
    const complianceRow = screen.getByRole('checkbox', { name: 'SLA compliance' }).closest('div');
    const metricsRow = screen.getByRole('checkbox', { name: 'Task metrics' }).closest('div');
    if (!complianceRow || !metricsRow) throw new Error('widget rows not found');

    const dataTransfer = { effectAllowed: '', setData: () => undefined };
    fireEvent.dragStart(complianceRow, { dataTransfer });
    fireEvent.dragOver(metricsRow, { dataTransfer });
    fireEvent.drop(metricsRow, { dataTransfer });

    const complianceRowLabel = within(complianceRow).getByText('SLA compliance');
    const complianceOrderBadge = complianceRowLabel.previousElementSibling;
    expect(complianceOrderBadge).toHaveTextContent('1');
  });

  it('personal mode reflects the admin Default scope\'s "Allow drag & drop" rule (admin can always reorder their own working copy)', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    // Turning "Allow drag & drop" off and saving the admin's Default scope
    // does not stop the admin from reordering their own working config —
    // @prototype index.html:L7215 `RULE_DND` is always true for the admin
    // builder itself; it only governs the signed-in end user afterwards.
    await user.click(screen.getByRole('switch', { name: 'Allow drag & drop' }));
    await user.click(screen.getByRole('button', { name: 'Save configuration' }));
    const complianceRowAfterAdminToggle = screen
      .getByRole('checkbox', { name: 'SLA compliance' })
      .closest('div');
    expect(complianceRowAfterAdminToggle).toHaveAttribute('draggable', 'true');

    // The signed-in user's own builder, however, is bound by that rule.
    await user.click(screen.getByRole('button', { name: 'User Configuration' }));
    const personalComplianceRow = screen
      .getByRole('checkbox', { name: 'SLA compliance' })
      .closest('div');
    expect(personalComplianceRow).toHaveAttribute('draggable', 'false');
  });

  it('blocks hiding a mandatory widget once "Lock mandatory widgets" is on', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    await user.click(screen.getByRole('switch', { name: 'Lock mandatory widgets' }));

    const metricsCheckbox = screen.getByRole('checkbox', { name: 'Task metrics' });
    await user.click(metricsCheckbox);

    expect(metricsCheckbox).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('This widget is locked as mandatory');
  });
});

describe('SettingsConfigurationPage — saved-configuration library', () => {
  it('loads a seeded entry, applying its widget set', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    await user.click(within(libraryEntryCard('Operations dashboard')).getByRole('button', { name: 'Load' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      '“Operations dashboard” loaded — save to apply',
    );
    // Operations dashboard's cfg is ['critical','highPri','metrics','impacted','workload'] — 5 widgets.
    expect(screen.getAllByText('5 / 15').length).toBeGreaterThan(0);
  });

  it('duplicates an entry as a new draft', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    expect(screen.queryByText('Executive dashboard (copy)')).not.toBeInTheDocument();
    await user.click(within(libraryEntryCard('Executive dashboard')).getByRole('button', { name: 'Duplicate' }));

    expect(screen.getByText('Executive dashboard (copy)')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Duplicated as draft');
  });

  it('deletes an entry', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    expect(screen.getByText('Executive dashboard')).toBeVisible();
    await user.click(within(libraryEntryCard('Executive dashboard')).getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('Executive dashboard')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('“Executive dashboard” deleted');
  });
});

describe('SettingsConfigurationPage — JSON import', () => {
  it('imports a valid file and flashes the import confirmation', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    const file = new File(
      [JSON.stringify({ config: { cols: 3, dnd: true, hide: true, ids: ['metrics', 'byDept'], lock: false }, scope: 'default' })],
      'tasks-dashboard-default.json',
      { type: 'application/json' },
    );

    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('file input not found');
    await user.upload(fileInput as HTMLInputElement, file);

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Configuration imported — save to apply',
    );
    expect(screen.getAllByText('2 / 15').length).toBeGreaterThan(0);
  });

  it('rejects an invalid file and changes nothing', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    const file = new File(['not json'], 'broken.json', { type: 'application/json' });
    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('file input not found');
    await user.upload(fileInput as HTMLInputElement, file);

    expect(await screen.findByRole('status')).toHaveTextContent(
      'That file is not a dashboard configuration',
    );
    expect(screen.getAllByText('11 / 15').length).toBeGreaterThan(0);
  });
});

describe('SettingsConfigurationPage — Arabic/RTL rendering', () => {
  it('renders the Arabic tab labels and section head', async () => {
    await act(async () => {
      await i18n.changeLanguage('ar');
    });
    render(<SettingsConfigurationPage />);

    expect(screen.getByRole('heading', { name: 'التهيئة' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'إعدادات المسؤول' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'إعدادات المستخدم' })).toBeVisible();
  });
});

describe('SettingsConfigurationPage — M11.1 exclusion regression', () => {
  it('never renders the unreachable user-administration UI (user list, permissions, MFA, delegate, status)', async () => {
    const user = userEvent.setup();
    render(<SettingsConfigurationPage />);

    const bannedText = [
      /Search users/i,
      /Invite a user/i,
      /Permissions/i,
      /Notification channels/i,
      /Two-factor authentication/i,
      /Delegate when away/i,
      /Reset password/i,
      /Venue access/i,
      /Approval limit/i,
    ];
    for (const pattern of bannedText) {
      expect(screen.queryByText(pattern)).not.toBeInTheDocument();
    }

    await user.click(screen.getByRole('button', { name: 'User Configuration' }));
    for (const pattern of bannedText) {
      expect(screen.queryByText(pattern)).not.toBeInTheDocument();
    }
  });
});
