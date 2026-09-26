import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { WorkflowsPage } from './WorkflowsPage';
import arWorkflows from '@/shared/i18n/locales/ar/workflows.json';
import enWorkflows from '@/shared/i18n/locales/en/workflows.json';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
});

describe('WorkflowsPage', () => {
  it('renders the exact four tabs and default expandable rules table', async () => {
    const user = userEvent.setup();
    const { container } = render(<WorkflowsPage />);
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      enWorkflows.tabs.rules,
      enWorkflows.tabs.flow,
      enWorkflows.tabs.auto,
      enWorkflows.tabs.sla,
    ]);
    expect(screen.getAllByRole('columnheader')).toHaveLength(8);
    expect(screen.getAllByText('Guest Complaint')).toHaveLength(3);
    expect(screen.getByText('Log & acknowledge guest')).toBeVisible();
    expect(container.querySelectorAll('[data-state="checked"]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-state="unchecked"]')).toHaveLength(1);

    const eventRow = screen.getByText('Event Request').closest('tr');
    expect(eventRow).not.toBeNull();
    if (!eventRow) throw new Error('Expected Event Request row');
    expect(eventRow).not.toHaveAttribute('tabindex');
    await user.click(eventRow);
    expect(screen.getByText('Capture brief & date')).toBeVisible();
    expect(screen.queryByText('Log & acknowledge guest')).not.toBeInTheDocument();
  });

  it('renders prototype KPI values and five-step timeline', async () => {
    const user = userEvent.setup();
    render(<WorkflowsPage />);
    await user.click(screen.getByRole('tab', { name: enWorkflows.tabs.flow }));
    const kpis = screen.getByTestId('workflow-kpis');
    expect(within(kpis).getByText('5')).toBeVisible();
    expect(within(kpis).getByText('3 h')).toBeVisible();
    expect(within(kpis).getByText('3')).toBeVisible();
    const timeline = screen.getByTestId('workflow-timeline');
    const stepEdits = within(timeline).getAllByRole('button');
    expect(stepEdits).toHaveLength(5);
    expect(screen.getByText('Close & capture CSAT')).toBeVisible();
    const beforeEdit = timeline.innerHTML;
    const firstEdit = stepEdits[0];
    if (!firstEdit) throw new Error('Expected step edit control');
    await user.click(firstEdit);
    expect(timeline.innerHTML).toBe(beforeEdit);
  });

  it('renders seven auto-routing cards and exact SLA escalation output', async () => {
    const user = userEvent.setup();
    const { container } = render(<WorkflowsPage />);
    await user.click(screen.getByRole('tab', { name: enWorkflows.tabs.auto }));
    expect(screen.getByText('Guest Compliment')).toBeVisible();
    expect(container.querySelectorAll('[data-state="checked"]')).toHaveLength(7);

    await user.click(screen.getByRole('tab', { name: enWorkflows.tabs.sla }));
    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.getByText('Step 2 owner')).toBeVisible();
    expect(screen.getByText('Department Head')).toBeVisible();
  });

  it('keeps all prototype authoring controls inert', async () => {
    const user = userEvent.setup();
    const { container } = render(<WorkflowsPage />);
    const before = container.innerHTML;
    for (const name of [
      enWorkflows.actions.discard,
      enWorkflows.actions.saveDraft,
      enWorkflows.actions.publish,
      enWorkflows.actions.newRule,
    ]) {
      await user.click(screen.getByRole('button', { name }));
    }
    const editButton = screen.getAllByRole('button', { name: 'Edit Guest Complaint' })[0];
    if (!editButton) throw new Error('Expected Guest Complaint edit button');
    await user.click(editButton);
    expect(screen.getByText('Log & acknowledge guest')).toBeVisible();
    expect(container.innerHTML).toBe(before);
  });

  it('renders the localized Arabic tabs, labels, and RTL switch translation', async () => {
    await i18n.changeLanguage('ar');
    render(<WorkflowsPage />);
    expect(screen.getByRole('tab', { name: arWorkflows.tabs.rules })).toBeVisible();
    expect(screen.getByText(arWorkflows.scope.version)).toBeVisible();
    expect(screen.getByRole('columnheader', { name: arWorkflows.rules.columns.routesTo })).toBeVisible();
    expect(i18n.dir()).toBe('rtl');
  });
});
