import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { EnquiriesPage } from './EnquiriesPage';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('en');
  document.documentElement.dir = 'ltr';
});

describe('M7.2 Enquiries', () => {
  it('renders exactly the verified Add fields and blank defaults', () => {
    render(<EnquiriesPage view="add" />);

    expect(
      screen.getByRole('heading', { name: 'Add an Enquiry' }),
    ).toBeVisible();
    expect(screen.getByLabelText('Subject')).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Process owner' })).toHaveValue(
      '',
    );
    expect(
      screen.getByRole('combobox', { name: 'Matrix partners' }),
    ).toHaveValue('');
    expect(screen.getByText('M. Faris — Duty Manager')).toBeVisible();
    expect(screen.getByText('28 Jul 2026 · 09:14')).toBeVisible();
    expect(screen.getByText('ENQ-135 (auto)')).toBeVisible();
    expect(
      screen.getByPlaceholderText(
        'What is being asked, by whom and any context the owner needs.',
      ),
    ).toHaveValue('');
    expect(
      screen.getByPlaceholderText('Internal note for the record trail.'),
    ).toHaveValue('');
    expect(
      screen.getByRole('button', { name: 'Submit enquiry' }),
    ).toBeDisabled();
  });

  it('requires a trimmed subject and a selected priority, while zero files are valid', async () => {
    const user = userEvent.setup();
    render(<EnquiriesPage view="add" />);
    const subject = screen.getByLabelText('Subject');
    const submit = screen.getByRole('button', { name: 'Submit enquiry' });

    await user.type(subject, '   ');
    await user.click(screen.getByRole('button', { name: 'Low' }));
    expect(submit).toBeDisabled();

    await user.clear(subject);
    await user.type(subject, 'Air conditioning question');
    expect(submit).toBeEnabled();
    expect(
      screen.getByText(
        'High priority enquiries notify the process owner immediately.',
      ),
    ).toBeVisible();
  });

  it.each([
    ['empty form', ''],
    ['subject only', 'Subject present'],
  ] as const)('keeps Submit disabled for %s', async (_label, subject) => {
    const user = userEvent.setup();
    render(<EnquiriesPage view="add" />);
    if (subject) await user.type(screen.getByLabelText('Subject'), subject);
    expect(screen.getByRole('button', { name: 'Submit enquiry' })).toBeDisabled();
  });

  it('keeps Submit disabled for priority-only and enables only when both required fields exist', async () => {
    const user = userEvent.setup();
    render(<EnquiriesPage view="add" />);
    const submit = screen.getByRole('button', { name: 'Submit enquiry' });

    await user.click(screen.getByRole('button', { name: 'Low' }));
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText('Subject'), 'Subject present');
    expect(submit).toBeEnabled();
  });

  it('applies the one-file caption truth table, including whitespace-only captions', async () => {
    const user = userEvent.setup();
    const { container } = render(<EnquiriesPage view="add" />);
    await user.type(screen.getByLabelText('Subject'), 'One file');
    await user.click(screen.getByRole('button', { name: 'High' }));
    const picker = container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!picker) throw new Error('Expected the Enquiry file picker');

    await user.upload(picker, new File(['one'], 'one.pdf'));
    const caption = screen.getByPlaceholderText('Caption (required)');
    const submit = screen.getByRole('button', { name: 'Submit enquiry' });
    expect(submit).toBeDisabled();

    await user.type(caption, '   ');
    expect(submit).toBeDisabled();
    await user.clear(caption);
    await user.type(caption, 'Caption');
    expect(submit).toBeEnabled();
    await user.clear(caption);
    expect(submit).toBeDisabled();
  });

  it('requires every selected file caption and updates gating immediately on add, edit, and remove', async () => {
    const user = userEvent.setup();
    const { container } = render(<EnquiriesPage view="add" />);
    await user.type(screen.getByLabelText('Subject'), 'Attachment check');
    await user.click(screen.getByRole('button', { name: 'Medium' }));
    const submit = screen.getByRole('button', { name: 'Submit enquiry' });
    expect(submit).toBeEnabled();

    const picker =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!picker) throw new Error('Expected the Enquiry file picker');
    await user.upload(picker, [
      new File(['one'], 'one.pdf'),
      new File(['two'], 'two.png'),
    ]);
    expect(submit).toBeDisabled();
    expect(
      screen.getByText('Add a caption to every attachment to submit.'),
    ).toBeVisible();

    const captions = screen.getAllByPlaceholderText('Caption (required)');
    expect(captions).toHaveLength(2);
    const firstCaption = captions[0];
    const secondCaption = captions[1];
    if (!firstCaption || !secondCaption)
      throw new Error('Expected two caption inputs');
    expect(firstCaption.parentElement).toHaveClass('border-bad');
    expect(secondCaption.parentElement).toHaveClass('border-bad');
    await user.type(firstCaption, 'Supporting document');
    await user.type(secondCaption, '   ');
    expect(submit).toBeDisabled();

    await user.clear(secondCaption);
    await user.type(secondCaption, 'Photo evidence');
    expect(submit).toBeEnabled();
    expect(firstCaption.parentElement).not.toHaveClass('border-bad');

    const firstRemove = screen.getAllByRole('button', { name: 'Remove' })[0];
    if (!firstRemove) throw new Error('Expected a Remove button');
    await user.click(firstRemove);
    expect(screen.queryByText('one.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('two.png')).toBeVisible();
    expect(submit).toBeEnabled();
  });

  it('allows duplicate file selections in append order and Clear resets the form', async () => {
    const user = userEvent.setup();
    const { container } = render(<EnquiriesPage view="add" />);
    const picker =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!picker) throw new Error('Expected the Enquiry file picker');
    const duplicate = new File(['same'], 'same.pdf');
    await user.upload(picker, duplicate);
    await user.upload(picker, duplicate);
    expect(screen.getAllByText('same.pdf')).toHaveLength(2);

    await user.type(screen.getByLabelText('Subject'), 'Reset me');
    await user.click(screen.getByRole('button', { name: 'High' }));
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Subject')).toHaveValue('');
    expect(screen.queryByText('same.pdf')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Submit enquiry' }),
    ).toBeDisabled();
  });

  it('shows only the prototype submit acknowledgement and preserves form state', async () => {
    const user = userEvent.setup();
    render(<EnquiriesPage view="add" />);
    await user.type(screen.getByLabelText('Subject'), 'Retained subject');
    await user.click(screen.getByRole('button', { name: 'High' }));
    await user.click(screen.getByRole('button', { name: 'Submit enquiry' }));

    expect(screen.getByText('Enquiry submitted · ENQ-135')).toBeVisible();
    expect(screen.getByLabelText('Subject')).toHaveValue('Retained subject');
    expect(screen.getByRole('button', { name: 'High' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('shows the exact fixed History rows and preserves literal tabs when switched', async () => {
    const user = userEvent.setup();
    render(<EnquiriesPage view="history" />);
    const table = screen.getByRole('table');

    expect(screen.getByRole('tab', { name: 'Open 12' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Closed 47' })).toBeVisible();
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    expect(
      within(table).getByText(
        'Aircon noise on floor 3 — escalating after 8 PM',
      ),
    ).toBeVisible();
    expect(
      within(table).getByText('Lighting flicker — corridor B'),
    ).toBeVisible();
    expect(screen.getByText('Showing 4 of 4 records')).toBeVisible();

    await user.click(screen.getByRole('tab', { name: 'Closed 47' }));
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    expect(within(table).getByText('ENQ-118')).toBeVisible();
  });

  it('renders Arabic Add labels in RTL while retaining Latin identifiers and digits', async () => {
    await i18n.changeLanguage('ar');
    document.documentElement.dir = 'rtl';
    render(<EnquiriesPage view="add" />);

    expect(
      screen.getByRole('heading', { name: 'إضافة استفسار' }),
    ).toBeVisible();
    expect(screen.getByLabelText('الموضوع')).toHaveAttribute(
      'placeholder',
      'سطر واحد يوجز الاستفسار',
    );
    expect(screen.getByText('ENQ-135 (auto)')).toBeVisible();
    expect(screen.getByText('28 Jul 2026 · 09:14')).toBeVisible();
  });

  it('keeps Save draft as acknowledgement-only behavior', () => {
    render(<EnquiriesPage view="add" />);
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(screen.getByText('Draft saved')).toBeVisible();
  });
});
