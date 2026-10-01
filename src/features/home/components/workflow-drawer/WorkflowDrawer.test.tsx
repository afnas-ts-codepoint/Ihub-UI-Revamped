import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { toast } from '@/shared/ui/feedback/Toaster';

import { useHomeQueueStore } from '../../store/homeQueue.store';
import type { QueueAction, QueueIncident, QueueJobOrder } from '../../types/queue.types';
import { WorkflowDrawer } from './WorkflowDrawer';

vi.mock('@/shared/ui/feedback/Toaster', () => ({ toast: vi.fn() }));

beforeAll(async () => {
  // jsdom lacks pointer capture, which Vaul calls on every pointerdown inside the drawer.
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
  await initializeI18n('en');
});
beforeEach(() => {
  vi.mocked(toast).mockClear();
});
afterEach(async () => {
  cleanup();
  act(() => {
    useHomeQueueStore.getState().reset();
  });
  await i18n.changeLanguage('en');
});

const store = () => useHomeQueueStore.getState();

function find<Item extends { id: string }>(list: readonly Item[], id: string): Item {
  const item = list.find((entry) => entry.id === id);
  if (!item) throw new Error(`Missing fixture ${id}`);
  return item;
}
const action = (id: string): QueueAction => find(store().actions, id);
const incident = (id: string): QueueIncident => find(store().incidents, id);
const jobOrder = (id: string): QueueJobOrder => find(store().jobOrders, id);

const openAction = (id: string, verify = false) => {
  act(() => {
    store().openDrawer('action', action(id), verify);
  });
};
const openIncident = (id: string) => {
  act(() => {
    store().openDrawer('incident', incident(id));
  });
};
const openJobOrder = (id: string) => {
  act(() => {
    store().openDrawer('jo', jobOrder(id));
  });
};

const renderDrawer = () => render(<WorkflowDrawer />);
const dialog = () => screen.getByRole('dialog');
const button = (name: string | RegExp) => screen.getByRole('button', { name });
const toastText = () => String(vi.mocked(toast).mock.calls.at(-1)?.[0]);

describe('WorkflowDrawer, action body', () => {
  it('renders nothing until the store opens a drawer', () => {
    renderDrawer();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it.each([
    ['A2', 'Purchase Approval (PC) — Cinema Projector Units ×2', 'high', 'Due today', 'Approve PC'],
    ['A6', 'Overtime — Weekend Inventory, Riyadh Park', 'medium', 'Due today', 'Approve'],
    ['A7', 'Approval Request — Facility Cleaning Renewal', 'medium', 'Due in 4 days', 'Review & approve'],
    ['A8', 'Leave Request — 12 days, Finance', 'low', 'Due in 6 days', 'Approve'],
  ])('opens %s with its header, chips and primary label', (id, title, priority, due, primary) => {
    renderDrawer();
    openAction(id);

    const drawer = within(dialog());
    expect(dialog()).toHaveAccessibleName(title);
    expect(drawer.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    expect(drawer.getByText('Approval workflow')).toBeInTheDocument();
    expect(drawer.getByText(priority)).toBeInTheDocument();
    expect(drawer.getByText(due)).toBeInTheDocument();
    expect(drawer.getByRole('button', { name: primary })).toBeInTheDocument();
  });

  it('shows reason, meta grid, impact, attachments, steps and the note box for A2', () => {
    renderDrawer();
    openAction('A2');
    const drawer = within(dialog());
    const a2 = action('A2');

    expect(drawer.getByText('Why this needs you')).toBeInTheDocument();
    expect(drawer.getByText(a2.reason)).toBeInTheDocument();
    for (const [label, value] of [
      ['Request owner', 'Khaled Ibrahim'],
      ['Department', 'Operations'],
      ['Amount', 'KWD 28,500'],
      ['Status', 'Pending approval'],
    ] as const) {
      expect(drawer.getByText(label)).toBeInTheDocument();
      // The history card's status pill repeats the Status value.
      expect(drawer.getAllByText(value).length).toBeGreaterThan(0);
    }
    expect(drawer.getByText('Financial & operational impact')).toBeInTheDocument();
    expect(drawer.getByText(a2.impact)).toBeInTheDocument();
    expect(drawer.getByText('PC_2026-0481.pdf')).toBeInTheDocument();
    expect(drawer.getByText('Projector_spec.pdf')).toBeInTheDocument();
    expect(drawer.getByText('What to do next')).toBeInTheDocument();
    for (const step of a2.steps) expect(drawer.getByText(step)).toBeInTheDocument();
    expect(drawer.getAllByText('Current step')).toHaveLength(1);
    expect(drawer.getByRole('textbox', { name: 'Add a note' })).toHaveAttribute(
      'placeholder',
      'Add a comment or note…',
    );
  });

  it('keeps the synthetic history collapsed until expanded, newest first', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openAction('A2');
    const drawer = within(dialog());

    // The block label and the card's own header both read "History & updates".
    expect(drawer.getAllByText('History & updates')).toHaveLength(2);
    const toggle = drawer.getByRole('button', { name: /History & updates/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(drawer.queryByText('Request submitted')).toBeNull();
    expect(within(toggle).getByText('3 events')).toBeInTheDocument();
    expect(within(toggle).getByText('Pending approval')).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const entries = drawer.getAllByRole('listitem').filter((item) => /ago/.test(item.textContent));
    expect(entries.map((item) => item.textContent)).toEqual([
      'Sent to committeeK. Ibrahim · 48 min ago',
      'Budget line checkedL. Haddad · 2 hours ago',
      'Request submittedM. Faris · 6 hours ago',
    ]);
  });

  it('closes on Escape, on the scrim and with the close button', async () => {
    const user = userEvent.setup();
    renderDrawer();

    openAction('A2');
    await user.keyboard('{Escape}');
    expect(store().drawer).toBeNull();
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull(); });

    openAction('A2');
    await user.click(screen.getByTestId('workflow-drawer-overlay'));
    expect(store().drawer).toBeNull();
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull(); });

    openAction('A2');
    await user.click(button('Close (Esc)'));
    expect(store().drawer).toBeNull();
  });

  it('Approve removes the item, closes the drawer, opens the track prompt and toasts', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openAction('A2');

    await user.click(button('Approve PC'));
    expect(store().actions.some((entry) => entry.id === 'A2')).toBe(false);
    expect(store().drawer).toBeNull();
    expect(store().trackPrompt).toEqual({ id: 'A2', title: 'Purchase Approval (PC) — Cinema Projector Units ×2' });
    expect(toastText()).toContain('Approve PC');
    expect(store().rejectedFeed).toHaveLength(0);
  });

  it('Reject removes the item and records the rejection without a track prompt', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openAction('A6');

    await user.click(button('Reject'));
    expect(store().actions.some((entry) => entry.id === 'A6')).toBe(false);
    expect(store().drawer).toBeNull();
    expect(store().trackPrompt).toBeNull();
    expect(store().rejectedFeed.map((entry) => entry.id)).toEqual(['A6']);
    expect(toastText()).toContain('owner notified');
  });

  it('Escalate keeps the drawer open on the stale snapshot while the store item goes critical/today', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openAction('A8');
    expect(within(dialog()).getByText('low')).toBeInTheDocument();

    await user.click(button('Escalate'));
    expect(store().drawer).not.toBeNull();
    expect(action('A8').priority).toBe('critical');
    expect(action('A8').dueState).toBe('today');
    // The prototype never refreshes the drawer snapshot: chips stay as opened.
    expect(within(dialog()).getByText('low')).toBeInTheDocument();
    expect(within(dialog()).getByText('Due in 6 days')).toBeInTheDocument();
    expect(within(dialog()).queryByText('critical')).toBeNull();
    expect(toastText()).toContain('Leave Request');
  });

  it('Clarify only closes the drawer', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openAction('A7');
    const before = store().actions;

    await user.click(button('Clarify'));
    expect(store().drawer).toBeNull();
    expect(store().actions).toBe(before);
    expect(store().trackPrompt).toBeNull();
    expect(toast).not.toHaveBeenCalled();
  });

  it('only changes the primary label in verify mode', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openAction('A2', true);

    expect(within(dialog()).queryByRole('button', { name: 'Approve PC' })).toBeNull();
    await user.click(button('Verify'));
    // Verify still approves (prototype quirk).
    expect(store().actions.some((entry) => entry.id === 'A2')).toBe(false);
    expect(store().trackPrompt?.id).toBe('A2');
  });

  it('keeps rendering the opened snapshot after a state refresh elsewhere', () => {
    renderDrawer();
    openAction('A2');
    act(() => {
      store().toggleSelected('A2');
    });
    expect(within(dialog()).getByText('Purchase Approval (PC) — Cinema Projector Units ×2')).toBeInTheDocument();
  });
});

describe('WorkflowDrawer, incident body', () => {
  it('renders the header, SLA tone, progress, timeline and note box for INC-2041', () => {
    renderDrawer();
    openIncident('INC-2041');
    const drawer = within(dialog());

    expect(dialog()).toHaveAccessibleName('POS network outage — 360 Mall');
    expect(drawer.getByText('Incident workflow')).toBeInTheDocument();
    expect(drawer.getByText('Critical')).toBeInTheDocument();
    expect(within(dialog()).getAllByText('Investigating').length).toBeGreaterThan(0);
    expect(drawer.getAllByText('INC-2041').length).toBeGreaterThan(0);
    expect(drawer.getByText('What happened')).toBeInTheDocument();
    for (const [label, value] of [
      ['Owner', 'Yazan Malik (IT)'],
      ['Location', '360 Mall'],
      ['Opened', '52m ago'],
      ['SLA', 'SLA breached · 18m over'],
    ] as const) {
      expect(drawer.getByText(label)).toBeInTheDocument();
      // "52m ago" also appears as the oldest timeline entry's time.
      expect(drawer.getAllByText(value).length).toBeGreaterThan(0);
    }
    expect(drawer.getByText('SLA breached · 18m over')).toHaveClass('text-bad');

    const progress = drawer.getByRole('progressbar', { name: 'Resolution progress' });
    expect(progress).toHaveAttribute('aria-valuenow', '40');
    expect(drawer.getByText('40% · updated 2m ago')).toBeInTheDocument();

    const timeline = drawer.getByText('Live updates').closest('section');
    if (!timeline) throw new Error('Missing live updates block');
    expect(
      within(timeline)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(
      incident('INC-2041').feed.map((entry) => `${entry.who}${entry.t}${entry.text}`),
    );
    expect(drawer.getByRole('textbox', { name: 'Add a note' })).toBeInTheDocument();
  });

  it('tones the SLA caption by state (at-risk warn, ok ok)', () => {
    renderDrawer();
    openIncident('INC-2039');
    expect(within(dialog()).getByText('SLA at risk · 40m left')).toHaveClass('text-warn');
    openIncident('INC-2037');
    expect(within(dialog()).getByText('Within SLA')).toHaveClass('text-ok');
  });

  it('Pin tracks the incident and the stale snapshot keeps offering Pin', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openIncident('INC-2039');

    await user.click(button('Pin to feed'));
    expect(incident('INC-2039').pinned).toBe(true);
    expect(incident('INC-2039').read).toBe(true);
    expect(store().trackedTasks.map((task) => task.id)).toEqual(['INC-2039']);
    expect(toastText()).toContain('INC-2039 pinned');
    expect(store().drawer).not.toBeNull();
    // Stale snapshot: the label does not flip to Unpin.
    expect(button('Pin to feed')).toBeInTheDocument();

    vi.mocked(toast).mockClear();
    await user.click(button('Pin to feed'));
    // willPin is computed from the stale snapshot: the real state toggles back to
    // unpinned, yet the tracker row is not duplicated and the pin toast repeats.
    expect(incident('INC-2039').pinned).toBe(false);
    expect(store().trackedTasks).toHaveLength(1);
    expect(toastText()).toContain('INC-2039 pinned');
  });

  it('shows Unpin for a pinned incident and unpins without a toast', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openIncident('INC-2041');

    await user.click(button('Unpin'));
    expect(incident('INC-2041').pinned).toBe(false);
    expect(toast).not.toHaveBeenCalled();
    expect(store().trackedTasks).toHaveLength(0);
  });

  it('Escalate climbs the severity ladder while the header chip stays stale', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openIncident('INC-2034');
    expect(within(dialog()).getByText('Medium')).toBeInTheDocument();

    await user.click(button('Escalate'));
    expect(incident('INC-2034').severity).toBe('high');
    await user.click(button('Escalate'));
    expect(incident('INC-2034').severity).toBe('critical');
    await user.click(button('Escalate'));
    expect(incident('INC-2034').severity).toBe('critical');
    expect(within(dialog()).getByText('Medium')).toBeInTheDocument();
    expect(toastText()).toContain('INC-2034');
    expect(store().drawer).not.toBeNull();
  });

  it('Assign only closes; Resolve dismisses the incident and closes', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openIncident('INC-2039');
    await user.click(button('Assign'));
    expect(store().drawer).toBeNull();
    expect(store().incidents).toHaveLength(5);

    openIncident('INC-2039');
    await user.click(button('Resolve'));
    expect(store().incidents.some((entry) => entry.id === 'INC-2039')).toBe(false);
    expect(store().drawer).toBeNull();
    expect(toastText()).toContain('INC-2039');
  });
});

describe('WorkflowDrawer, job-order body', () => {
  it('renders the task workflow header, meta, history, steps and note box', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openJobOrder('JO-7782');
    const drawer = within(dialog());

    expect(dialog()).toHaveAccessibleName('Replace cinema projector lamp — Screen 6');
    expect(drawer.getByText('Task workflow')).toBeInTheDocument();
    expect(drawer.getByText('high')).toBeInTheDocument();
    expect(drawer.getAllByText('JO-7782').length).toBeGreaterThan(0);
    // Job orders have no due state, so there is no due chip.
    expect(drawer.queryByText('Due tomorrow')).toBeNull();
    expect(drawer.getByText(jobOrder('JO-7782').detail)).toBeInTheDocument();
    for (const [label, value] of [
      ['Location', 'SAMA Mall'],
      ['Requestor dept.', 'Operations'],
      ['Matrix partner', 'In-house AV team'],
      ['Type', 'Internal'],
    ] as const) {
      expect(drawer.getByText(label)).toBeInTheDocument();
      expect(drawer.getByText(value)).toBeInTheDocument();
    }
    expect(drawer.getByText('Review JO')).toBeInTheDocument();
    expect(drawer.getAllByText('Current step')).toHaveLength(1);
    expect(drawer.queryByText('Attachments')).toBeNull();
    expect(drawer.queryByText('Live updates')).toBeNull();
    expect(drawer.queryByText('Financial & operational impact')).toBeNull();

    const toggle = drawer.getByRole('button', { name: /History & updates/ });
    await user.click(toggle);
    expect(drawer.getByText('Task created')).toBeInTheDocument();
    expect(within(toggle).getByText('New')).toBeInTheDocument();
  });

  it('shows External for an external job order', () => {
    renderDrawer();
    openJobOrder('JO-7781');
    expect(within(dialog()).getByText('External')).toBeInTheDocument();
  });

  it('Assign & approve flips isNew/status and closes the drawer without a track prompt', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openJobOrder('JO-7782');

    await user.click(button('Assign & approve'));
    expect(jobOrder('JO-7782').isNew).toBe(false);
    expect(jobOrder('JO-7782').status).toBe('Assigned');
    expect(store().drawer).toBeNull();
    expect(store().trackPrompt).toBeNull();
    expect(toastText()).toContain('JO-7782 assigned');
  });

  it('Dismiss removes the job order but the drawer stays open (prototype quirk)', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openJobOrder('JO-7782');

    await user.click(button('Dismiss'));
    expect(store().jobOrders.some((entry) => entry.id === 'JO-7782')).toBe(false);
    expect(store().drawer).not.toBeNull();
    expect(dialog()).toBeInTheDocument();
    expect(toastText()).toContain('JO-7782 dismissed');
  });

  it('Add comment only closes', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openJobOrder('JO-7782');
    await user.click(button('Add comment'));
    expect(store().drawer).toBeNull();
    expect(store().jobOrders).toHaveLength(6);
  });

  it('still offers Assign & approve for Track-state rows and overwrites their status', async () => {
    const user = userEvent.setup();
    renderDrawer();
    openJobOrder('JO-7775');
    expect(jobOrder('JO-7775').status).toBe('In progress');

    await user.click(button('Assign & approve'));
    expect(jobOrder('JO-7775').status).toBe('Assigned');
  });
});

describe('WorkflowDrawer, direction and Arabic', () => {
  it('opens on the right in LTR', () => {
    renderDrawer();
    openAction('A2');
    expect(dialog()).toHaveAttribute('data-vaul-drawer-direction', 'right');
  });

  it('opens on the inline-end (left) side in RTL with Arabic strings', async () => {
    await i18n.changeLanguage('ar');
    renderDrawer();
    openAction('A2');
    const drawer = within(dialog());

    expect(dialog()).toHaveAttribute('data-vaul-drawer-direction', 'left');
    // Pinned to the inline end (the shared content defaults to the logical start, which is the wrong edge in RTL).
    expect(dialog().className).toContain('data-[vaul-drawer-direction=left]:end-0');
    expect(dialog().className).toContain('data-[vaul-drawer-direction=left]:start-auto');
    expect(drawer.getByText('سير الموافقة')).toBeInTheDocument();
    expect(drawer.getByText('لماذا يحتاجك')).toBeInTheDocument();
    expect(drawer.getByText('مالك الطلب')).toBeInTheDocument();
    expect(drawer.getByText('الأثر المالي والتشغيلي')).toBeInTheDocument();
    expect(drawer.getByText('المرفقات')).toBeInTheDocument();
    expect(drawer.getByText('الخطوة التالية')).toBeInTheDocument();
    expect(drawer.getByRole('textbox', { name: 'أضف ملاحظة' })).toHaveAttribute('placeholder', 'أضف تعليقاً…');
    expect(drawer.getByRole('button', { name: 'رفض' })).toBeInTheDocument();
    expect(drawer.getByRole('button', { name: 'استيضاح' })).toBeInTheDocument();
    // Hard-coded English in the prototype stays English in Arabic.
    expect(drawer.getByText('Current step')).toBeInTheDocument();
    expect(drawer.getByRole('button', { name: 'Escalate' })).toBeInTheDocument();
    expect(drawer.getByRole('button', { name: 'Close (Esc)' })).toBeInTheDocument();
  });

  it('renders the Arabic incident body and uses a logical timeline connector', async () => {
    await i18n.changeLanguage('ar');
    renderDrawer();
    openIncident('INC-2041');
    const drawer = within(dialog());

    expect(drawer.getByText('سير الحادث')).toBeInTheDocument();
    expect(drawer.getByText('ما الذي حدث')).toBeInTheDocument();
    expect(drawer.getByText('40% · حُدّث 2m ago')).toBeInTheDocument();
    expect(drawer.getByText('SLA')).toBeInTheDocument();
    const connectors = dialog().querySelectorAll('li > span[aria-hidden="true"]');
    expect(connectors.length).toBeGreaterThan(0);
    for (const connector of connectors) {
      expect(connector.className).toContain('start-3');
      expect(connector.className).not.toMatch(/(^|\s)(left|right)-/);
    }
  });
});
