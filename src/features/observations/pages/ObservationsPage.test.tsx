import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ObservationsPage } from './ObservationsPage';
import { OBSERVATION_ROWS } from '../data/observations.mock';
import { reportDefinitionFor } from '@/features/reports';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { Toaster } from '@/shared/ui/feedback/Toaster';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

describe('M7.3 Observations', () => {
  it('preserves caption-only gating and the subject inconsistency with zero attachments', async () => {
    const user = userEvent.setup();
    render(<ObservationsPage view="add" />);
    const subject = screen.getByRole('textbox', { name: 'Subject' });
    const submit = screen.getByRole('button', { name: 'Submit observation' });
    expect(subject).toHaveValue('');
    expect(submit).toBeEnabled();

    await user.type(subject, 'A populated subject');
    expect(submit).toBeEnabled();
    await user.clear(subject);
    await user.type(subject, '   ');
    expect(submit).toBeEnabled();
    await user.click(submit);
    expect(screen.getByText('Observation submitted')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Subject' })).toHaveValue('   ');
  });

  it('requires every generated attachment caption, trims whitespace, and removes missing-caption blockers', async () => {
    const user = userEvent.setup();
    render(<ObservationsPage view="add" />);
    const submit = screen.getByRole('button', { name: 'Submit observation' });
    const add = screen.getByRole('button', { name: 'Add file' });

    await user.click(add);
    expect(screen.getByText('photo-1.jpg')).toBeVisible();
    expect(submit).toBeDisabled();
    const firstCaption = screen.getByPlaceholderText('Caption (required)');
    await user.type(firstCaption, '   ');
    expect(submit).toBeDisabled();
    await user.clear(firstCaption);
    await user.type(firstCaption, 'Wet floor context');
    expect(submit).toBeEnabled();

    await user.click(add);
    expect(screen.getByText('photo-2.jpg')).toBeVisible();
    expect(submit).toBeDisabled();
    const captions = screen.getAllByPlaceholderText('Caption (required)');
    const secondCaption = captions[1];
    if (!secondCaption) throw new Error('Expected a second caption input');
    await user.type(secondCaption, 'Wide shot');
    expect(submit).toBeEnabled();

    await user.clear(secondCaption);
    expect(submit).toBeDisabled();
    const removeButtons = screen.getAllByRole('button', { name: 'Remove' });
    const secondRemove = removeButtons[1];
    if (!secondRemove) throw new Error('Expected a second Remove button');
    await user.click(secondRemove);
    expect(submit).toBeEnabled();
  });

  it('keeps severity, priority, matrix partners, and linked records out of gating', async () => {
    const user = userEvent.setup();
    render(<ObservationsPage view="add" />);
    const submit = screen.getByRole('button', { name: 'Submit observation' });
    const severity = screen.getByRole('group', { name: 'Severity' });
    const priority = screen.getByRole('group', { name: 'Priority' });

    await user.click(within(severity).getByRole('button', { name: 'High' }));
    await user.click(within(priority).getByRole('button', { name: 'Low' }));
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Matrix partners' }),
      'Facilities',
    );
    expect(
      screen.getByRole('button', { name: 'Remove Facilities' }),
    ).toBeVisible();

    const enquiry = screen.getByRole('combobox', {
      name: 'Enquiry reference number',
    });
    await user.selectOptions(
      enquiry,
      'ENQ-118 — Party booking availability, Al Kout',
    );
    const linkedSection = enquiry.closest('div');
    if (!linkedSection) throw new Error('Expected linked-record controls');
    await user.click(
      within(linkedSection).getByRole('button', { name: 'Link' }),
    );
    expect(
      screen.getByText('ENQ-118 — Party booking availability, Al Kout'),
    ).toBeVisible();
    expect(submit).toBeEnabled();
  });

  it('keeps every severity, priority, and linked-record type independent of gating', async () => {
    const user = userEvent.setup();
    render(<ObservationsPage view="add" />);
    const submit = screen.getByRole('button', { name: 'Submit observation' });
    const severity = screen.getByRole('group', { name: 'Severity' });
    const priority = screen.getByRole('group', { name: 'Priority' });

    for (const value of ['Low', 'Medium', 'High']) {
      const button = within(severity).getByRole('button', { name: value });
      await user.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(submit).toBeEnabled();
    }
    for (const value of ['Low', 'Medium', 'High']) {
      const button = within(priority).getByRole('button', { name: value });
      await user.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(submit).toBeEnabled();
    }

    const links = [
      [
        'Enquiry reference number',
        'ENQ-118 â€” Party booking availability, Al Kout',
      ],
      [
        'Task reference number',
        'TSK-2026-311 â€” Replace queue barrier tape, 360 Mall',
      ],
      [
        'Incident reference number',
        'INC-2030 â€” Digital signage display down, Al Kout',
      ],
    ] as const;
    for (const [label] of links) {
      const select = screen.getByRole('combobox', { name: label });
      const prefix = label.startsWith('Enquiry')
        ? 'ENQ-118'
        : label.startsWith('Task')
          ? 'TSK-2026-311'
          : 'INC-2030';
      const option = within(select).getByRole('option', {
        name: new RegExp(`^${prefix}`),
      });
      await user.selectOptions(select, option);
      const container = select.closest('div');
      if (!container) throw new Error(`Expected link controls for ${label}`);
      await user.click(within(container).getByRole('button', { name: 'Link' }));
      expect(screen.getByText(option.textContent)).toBeVisible();
      expect(submit).toBeEnabled();
    }
  });

  it('preserves message-only Save draft and Clear behavior', async () => {
    const user = userEvent.setup();
    render(<ObservationsPage view="add" />);
    const subject = screen.getByRole('textbox', { name: 'Subject' });
    await user.type(subject, 'Visible draft');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(screen.getByText('Draft saved')).toBeVisible();
    expect(subject).toHaveValue('Visible draft');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(subject).toHaveValue('');
  });

  it('renders exact assignment rows and keeps reassignment message-only and Open inert', async () => {
    const user = userEvent.setup();
    render(<ObservationsPage view="assignment" />);
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    expect(within(table).getByText('OBS-2026-072')).toBeVisible();
    const assignee = screen.getByRole('combobox', {
      name: 'Assigned to for OBS-2026-072',
    });
    await user.selectOptions(assignee, 'Operations — K. Ibrahim');
    expect(
      screen.getByText('Assignment updated for OBS-2026-072'),
    ).toBeVisible();
    const open = screen.getAllByRole('button', { name: 'Open' })[0];
    if (!open) throw new Error('Expected an Open button');
    await user.click(open);
    expect(within(table).getAllByRole('row')).toHaveLength(5);
  });

  it('renders the exact fixed History fixture without filtering its rows', async () => {
    const user = userEvent.setup();
    render(<ObservationsPage view="history" />);
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    expect(within(table).getByText('REC-2026412')).toBeVisible();
    expect(within(table).getByText('Task TSK-2026-401 created')).toBeVisible();
    expect(
      within(table).getByText('Coaching delivered, no injury'),
    ).toBeVisible();
    await user.type(
      screen.getByPlaceholderText(/OBS-2026-072/),
      'no matching history row',
    );
    expect(within(table).getAllByRole('row')).toHaveLength(5);
  });

  it('renders the SectionReport fixture and preserves its period and email no-ops', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ObservationsPage view="report" />
        <Toaster />
      </>,
    );
    expect(
      screen.getByRole('heading', { name: 'Observations — Report' }),
    ).toBeVisible();
    expect(screen.getByText('4 rows')).toBeVisible();
    expect(screen.getByText('Open observations: 3 of 4')).toBeVisible();
    expect(screen.getByText('OBS-2026-072')).toBeVisible();
    const period = screen.getByRole('combobox', { name: 'Period' });
    await user.type(period, 'This week');
    await user.click(screen.getByRole('option', { name: 'This week' }));
    expect(period).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Email report' }));
    expect(screen.getByText('Report emailed to your inbox')).toBeVisible();
  });

  it('keeps the dedicated ObservationsView fixture independent under D16', () => {
    const report = reportDefinitionFor('observations');
    expect(OBSERVATION_ROWS[0].title).toBe(
      'Wet floor near Jump entry — no signage placed',
    );
    expect(report?.rows[0]?.[1]).toBe('Wet floor near Jump entry — no signage');
    expect(OBSERVATION_ROWS[0].title).not.toBe(report?.rows[0]?.[1]);
  });

  it('renders Arabic controls in RTL while retaining Latin identifiers', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    render(<ObservationsPage view="add" />);
    expect(screen.getByRole('textbox', { name: 'الموضوع' })).toBeVisible();
    expect(screen.getByText('OBS-2026-073 (auto)')).toBeVisible();
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
  });
});
