import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { HomeTopBanner, greetingKeyForHour } from './HomeTopBanner';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  vi.useRealTimers();
  document.documentElement.dir = 'ltr';
  await i18n.changeLanguage('en');
});

function renderBanner() {
  return render(
    <MemoryRouter>
      <HomeTopBanner activeTab="overview" />
    </MemoryRouter>,
  );
}

describe('HomeTopBanner', () => {
  it('renders deterministic Bahrain time and prototype-derived counts', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-25T05:00:00.000Z'));
    renderBanner();
    expect(screen.getByText('08:00:00')).toBeVisible();
    expect(screen.getByText('Asia/Bahrain')).toBeVisible();
    const tabs = screen.getByTestId('home-tab-bar');
    expect(within(tabs).getByRole('button', { name: /Assigned16/ })).toBeVisible();
    expect(within(tabs).getByRole('button', { name: /Incidents5/ })).toBeVisible();
    expect(screen.getByTestId('pulse-strip')).toHaveTextContent('10');
  });

  it('keeps the same Latin-digit 24-hour clock in Arabic RTL', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-25T05:00:00.000Z'));
    document.documentElement.dir = 'rtl';
    await i18n.changeLanguage('ar');
    renderBanner();
    expect(screen.getByText('08:00:00')).toBeVisible();
    expect(screen.getByText('آسيا/البحرين')).toBeVisible();
    expect(screen.getByRole('navigation', { name: 'أقسام الصفحة الرئيسية' })).toBeVisible();
  });

  it('opens and closes the exact AI provider menu', async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(screen.getByRole('button', { name: /AI Subscription/ }));
    expect(await screen.findByRole('menuitem', { name: /Claude/ })).toHaveAttribute('href', 'https://claude.ai');
    expect(screen.getByRole('menuitem', { name: /ChatGPT/ })).toHaveAttribute('href', 'https://chatgpt.com');
    expect(screen.getByRole('menuitem', { name: /Gemini/ })).toHaveAttribute('href', 'https://gemini.google.com');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menuitem', { name: /Claude/ })).not.toBeInTheDocument();
  });

  it('uses the prototype greeting thresholds', () => {
    expect(greetingKeyForHour(11)).toBe('greeting.morning');
    expect(greetingKeyForHour(12)).toBe('greeting.afternoon');
    expect(greetingKeyForHour(17)).toBe('greeting.afternoon');
    expect(greetingKeyForHour(18)).toBe('greeting.evening');
  });
});
