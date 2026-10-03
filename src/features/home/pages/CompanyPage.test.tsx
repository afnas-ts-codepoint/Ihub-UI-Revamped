import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { i18n, initializeI18n } from '@/shared/i18n/i18n';

import { CompanyPage } from './CompanyPage';

beforeAll(async () => initializeI18n('en'));
afterEach(async () => {
  cleanup();
  document.documentElement.dir = 'ltr';
  await i18n.changeLanguage('en');
});

describe('CompanyPage', () => {
  it('renders the quarter analytics card with its fixed figures', async () => {
    render(<CompanyPage />);
    expect(screen.getByRole('heading', { name: 'This quarter' })).toBeVisible();
    expect(screen.getByText('Revenue & operating tracker')).toBeVisible();
    expect(screen.getByText('On track')).toBeVisible();
    for (const text of ['KWD 6.9M', '+12.4% YoY', '1,248', '+48 this Q', '62', '↑ 4 pts']) {
      expect(screen.getByText(text)).toBeVisible();
    }
    const chart = await screen.findByRole('img', { name: 'Monthly revenue and operating trend' });
    expect(chart.querySelectorAll('[data-value]')).toHaveLength(12);
  });

  it('marks today and the event days on the April 2026 month grid', () => {
    render(<CompanyPage />);
    expect(screen.getByRole('heading', { name: 'Calendar' })).toBeVisible();
    expect(screen.getByText('April 2026')).toBeVisible();
    // 3 leading blanks + 30 days; day 19 is today (accent fill, no dot), 21/22/24/28 carry a dot.
    const grid = screen.getByTestId('month-calendar-days');
    expect(grid.children).toHaveLength(33);
    const cells = [...grid.children];
    const dotted = cells.filter((cell) => cell.querySelector('span'));
    expect(dotted.map((cell) => cell.textContent)).toEqual(['21', '22', '24', '28']);
    expect(cells.find((cell) => cell.textContent === '19')).toHaveClass('bg-accent');
  });

  it('lists the first three events with their day, month and time', () => {
    render(<CompanyPage />);
    for (const title of ['Today — Board review', 'Q2 All-Hands', '1:1 with Sara']) {
      expect(screen.getByText(title)).toBeVisible();
    }
    expect(screen.queryByText('Budget lockdown')).toBeNull();
    expect(screen.getAllByText('Apr')).toHaveLength(3);
    expect(screen.getByText('10:30 AM')).toBeVisible();
  });

  it('shows the three announcements with an inert Read more button', () => {
    render(<CompanyPage />);
    expect(screen.getByRole('heading', { name: 'Company' })).toBeVisible();
    expect(screen.getByText('News from across Tamdeen Entertainment')).toBeVisible();
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(3);
    expect(within(articles[0] as HTMLElement).getByText('Event')).toBeVisible();
    expect(
      within(articles[1] as HTMLElement).getByText('New expense policy effective May 1'),
    ).toBeVisible();
    expect(within(articles[2] as HTMLElement).getByText('2d')).toBeVisible();
    expect(screen.getAllByRole('button', { name: 'Read more' })).toHaveLength(3);
  });

  it('translates the labels to Arabic while leaving the fixture literals in English', async () => {
    await i18n.changeLanguage('ar');
    render(<CompanyPage />);
    expect(screen.getByRole('heading', { name: 'هذا الربع' })).toBeVisible();
    expect(screen.getByText('الإيرادات')).toBeVisible();
    expect(screen.getByText('عدد الموظفين')).toBeVisible();
    expect(screen.getByText('الرضا')).toBeVisible();
    expect(screen.getByText('على المسار')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'التقويم' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'الشركة' })).toBeVisible();
    expect(screen.getAllByRole('button', { name: 'اقرأ المزيد' })).toHaveLength(3);
    // Prototype literals stay English in Arabic.
    expect(screen.getByText('April 2026')).toBeVisible();
    expect(screen.getByText('KWD 6.9M')).toBeVisible();
    expect(screen.getByText('Q2 all-hands — Thursday 2 PM')).toBeVisible();
  });
});
