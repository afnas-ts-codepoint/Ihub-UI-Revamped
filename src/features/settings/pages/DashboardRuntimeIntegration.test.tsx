import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { SettingsConfigurationPage } from './SettingsConfigurationPage';
import { TASK_DASHBOARD_MANDATORY_IDS, TASK_DASHBOARD_WIDGETS } from '../data/taskDashboardWidgets.data';
import { sanitizeUserConfig } from '../domain/sanitizeUserConfig';
import { useDashboardConfigStore } from '../store/dashboardConfig.store';
import {
  DEFAULT_TASK_DASHBOARD_CONFIG,
  effectiveTaskDashboardConfig,
  sanitizeTaskDashboardConfig,
  TasksPage,
  useTaskDashboardConfigStore,
} from '@/features/tasks';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));

beforeEach(() => {
  localStorage.clear();
  useTaskDashboardConfigStore.getState().reset();
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

function widgetIds(): string[] {
  return [...screen.getByTestId('task-dashboard').querySelectorAll('[data-widget-id]')].map(
    (node) => node.getAttribute('data-widget-id') ?? '',
  );
}

/** Settings and the real Tasks dashboard mounted together: a save must show up live. */
async function renderBoth() {
  const user = userEvent.setup();
  render(
    <>
      <SettingsConfigurationPage />
      <TasksPage />
    </>,
  );
  await user.click(screen.getByRole('button', { name: 'Dashboard' }));
  await screen.findByTestId('task-dashboard', undefined, { timeout: 5_000 });
  return user;
}

describe('M11.3 — Settings → Tasks dashboard runtime integration', () => {
  it('runs the dashboard from the default config when nothing is saved', async () => {
    await renderBoth();
    expect(widgetIds()).toEqual(DEFAULT_TASK_DASHBOARD_CONFIG.ids);
  });

  it('applies a saved Default layout to the live dashboard (hide + columns)', async () => {
    const user = await renderBoth();
    await user.click(screen.getByRole('checkbox', { name: 'SLA compliance' }));
    await user.click(screen.getByRole('radio', { name: /Three columns/ }));
    expect(widgetIds()).toContain('compliance'); // not saved yet

    await user.click(screen.getByRole('button', { name: 'Save configuration' }));

    expect(widgetIds()).not.toContain('compliance');
    expect(screen.getByTestId('task-dashboard').style.getPropertyValue('--task-dashboard-cols')).toBe('3');
    const runtime = useTaskDashboardConfigStore.getState().organizationConfig;
    expect(runtime.cols).toBe(3);
    expect(runtime.ids).not.toContain('compliance');
  });

  it('keeps one source of truth: the Default is not duplicated in the Settings store', async () => {
    const user = await renderBoth();
    await user.click(screen.getByRole('checkbox', { name: 'SLA compliance' }));
    await user.click(screen.getByRole('button', { name: 'Save configuration' }));
    expect(useDashboardConfigStore.getState().adminConfigsByDashboard.tasks?.default).toBeUndefined();
    expect(JSON.parse(localStorage.getItem('ihub.v2.taskdash.config') ?? '{}')).toHaveProperty('state.organizationConfig');
  });

  it('applies a personal layout inside the admin rules, live', async () => {
    const user = await renderBoth();
    await user.click(screen.getByRole('button', { name: 'User Configuration' }));
    await user.click(screen.getByRole('checkbox', { name: 'By source of task' }));
    await user.click(screen.getByRole('button', { name: 'Save my layout' }));

    expect(widgetIds()).not.toContain('source');
    expect(useTaskDashboardConfigStore.getState().personalConfig?.ids).not.toContain('source');
    // The organisation default is untouched by a personal save.
    expect(useTaskDashboardConfigStore.getState().organizationConfig).toEqual(DEFAULT_TASK_DASHBOARD_CONFIG);
  });

  it('forces hidden widgets back when the admin disallows hiding', async () => {
    const user = await renderBoth();
    await user.click(screen.getByRole('switch', { name: 'Allow hiding widgets' }));
    await user.click(screen.getByRole('button', { name: 'Save configuration' }));

    await user.click(screen.getByRole('button', { name: 'User Configuration' }));
    await user.click(screen.getByRole('checkbox', { name: 'By source of task' }));
    expect(screen.getByRole('status')).toHaveTextContent('doesn’t allow hiding widgets');
    expect(widgetIds()).toContain('source');
  });

  it('inherits the admin Default for a user with no personal config', async () => {
    const user = await renderBoth();
    await user.click(screen.getByRole('checkbox', { name: 'By department' }));
    await user.click(screen.getByRole('button', { name: 'Save configuration' }));
    expect(useTaskDashboardConfigStore.getState().personalConfig).toBeNull();
    expect(widgetIds()).not.toContain('byDept');
  });

  it('does not change the runtime for Role / Department / User scoped saves (PROTOTYPE-NOOP)', async () => {
    const user = await renderBoth();
    await user.click(screen.getByRole('radio', { name: /Role-based/ }));
    await user.click(screen.getByRole('checkbox', { name: 'SLA compliance' }));
    await user.click(screen.getByRole('button', { name: 'Save configuration' }));

    expect(widgetIds()).toEqual(DEFAULT_TASK_DASHBOARD_CONFIG.ids);
    expect(useTaskDashboardConfigStore.getState().organizationConfig).toEqual(DEFAULT_TASK_DASHBOARD_CONFIG);
    const scoped = useDashboardConfigStore.getState().adminConfigsByDashboard.tasks ?? {};
    expect(Object.keys(scoped).some((key) => key.startsWith('role:'))).toBe(true);
  });

  it('does not touch the Tasks runtime when another dashboard is saved', async () => {
    const user = await renderBoth();
    const picker = screen.getByRole('combobox', { name: 'Dashboard' });
    await user.click(picker);
    await user.type(picker, 'Home overview');
    await user.keyboard('{Enter}');
    await user.click(await screen.findByRole('checkbox', { name: 'Daily brief' }));
    await user.click(screen.getByRole('button', { name: 'Save configuration' }));

    expect(useTaskDashboardConfigStore.getState().organizationConfig).toEqual(DEFAULT_TASK_DASHBOARD_CONFIG);
    expect(useDashboardConfigStore.getState().adminConfigsByDashboard.home?.default).toBeDefined();
  });

  it('shows the saved layout again after a remount (persistence)', async () => {
    const user = await renderBoth();
    await user.click(screen.getByRole('checkbox', { name: 'SLA compliance' }));
    await user.click(screen.getByRole('button', { name: 'Save configuration' }));
    cleanup();

    render(<SettingsConfigurationPage />);
    expect(screen.getByRole('checkbox', { name: 'SLA compliance' })).toHaveAttribute('aria-checked', 'false');
  });
});

describe('M11.3 — runtime and builder share one inheritance model', () => {
  const ids = TASK_DASHBOARD_WIDGETS.map((widget) => widget.id);
  const org = { cols: 2, dnd: true, hide: true, ids, lock: false } as const;

  it.each([
    ['plain', org],
    ['no hiding', { ...org, hide: false }],
    ['no reordering', { ...org, dnd: false }],
    ['locked', { ...org, lock: true, ids: ids.filter((id) => id !== 'metrics') }],
    ['reduced default', { ...org, ids: ['metrics', 'workload', 'critical'] }],
  ])('builder sanitizer and runtime effective config agree (%s)', (_name, adminConfig) => {
    const personal = { cols: 3 as const, ids: ['workload', 'bogus', 'critical', 'compliance'] };
    const runtimeOrg = sanitizeTaskDashboardConfig(adminConfig, DEFAULT_TASK_DASHBOARD_CONFIG);
    const builder = sanitizeUserConfig(personal, runtimeOrg, TASK_DASHBOARD_MANDATORY_IDS);
    const runtime = effectiveTaskDashboardConfig(
      runtimeOrg,
      sanitizeTaskDashboardConfig({ ...runtimeOrg, ...personal }, runtimeOrg),
    );
    expect(runtime.ids).toEqual(builder?.ids);
    expect(runtime.cols).toBe(builder?.cols);
  });

  it('drops unknown widget ids and falls back on invalid column counts', () => {
    const result = sanitizeTaskDashboardConfig(
      { cols: 9, dnd: 'x', hide: true, ids: ['metrics', 'ghost'], lock: false },
      DEFAULT_TASK_DASHBOARD_CONFIG,
    );
    expect(result.ids).toEqual(['metrics']);
    expect(result.cols).toBe(2);
    expect(result.dnd).toBe(true);
    expect(sanitizeTaskDashboardConfig({ ids: 'nope' }, DEFAULT_TASK_DASHBOARD_CONFIG)).toBe(DEFAULT_TASK_DASHBOARD_CONFIG);
  });
});

describe('M11.3 — Arabic / RTL', () => {
  it('applies a saved layout while the dashboard renders in Arabic', async () => {
    const user = await renderBoth();
    await user.click(screen.getByRole('checkbox', { name: 'SLA compliance' }));
    await user.click(screen.getByRole('button', { name: 'Save configuration' }));
    await i18n.changeLanguage('ar');
    expect(i18n.language).toBe('ar');
    expect(widgetIds()).not.toContain('compliance');
  });
});
