import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import {
  captureSideBySide,
  prepareApplication,
  preparePrototype,
  type QaLocale,
  type QaTheme,
} from './helpers';

type TopBarState = Readonly<{
  name: string;
  setup?: (
    prototype: Page,
    application: Page,
    locale: QaLocale,
    width: number,
  ) => Promise<void>;
}>;

async function openSearch(page: Page, locale: QaLocale, selected = false) {
  const title = locale === 'ar' ? 'بحث' : 'Search';
  const query = locale === 'ar' ? 'لوحة' : 'Dashboard';

  await page.locator(`[title="${title}"]`).first().click();
  await page.getByRole('combobox').fill(query);
  if (selected) await page.getByRole('combobox').press('ArrowDown');
}

async function openNotifications(page: Page, locale: QaLocale, unread = false) {
  await page
    .locator(
      '[data-testid="notifications-trigger"], button[title="Notifications"]',
    )
    .first()
    .click();
  if (unread) {
    await page
      .getByText(locale === 'ar' ? 'غير المقروءة' : 'Unread', { exact: true })
      .click();
  }
}

const states: readonly TopBarState[] = [
  { name: 'default-top-bar' },
  {
    name: 'command-search-results',
    setup: async (prototype, application, locale, width) => {
      if (width <= 760) return;
      await Promise.all([
        openSearch(prototype, locale),
        openSearch(application, locale),
      ]);
    },
  },
  {
    name: 'command-search-selected',
    setup: async (prototype, application, locale, width) => {
      if (width <= 760) return;
      await Promise.all([
        openSearch(prototype, locale, true),
        openSearch(application, locale, true),
      ]);
    },
  },
  {
    name: 'notifications-all',
    setup: async (prototype, application, locale) => {
      await Promise.all([
        openNotifications(prototype, locale),
        openNotifications(application, locale),
      ]);
    },
  },
  {
    name: 'notifications-unread',
    setup: async (prototype, application, locale) => {
      await Promise.all([
        openNotifications(prototype, locale, true),
        openNotifications(application, locale, true),
      ]);
    },
  },
];

const widths = [1440, 1040, 760, 390] as const;
const themes: readonly QaTheme[] = ['paper', 'ink'];
const locales: readonly QaLocale[] = ['en', 'ar'];
const evidenceRoot = resolve('docs/migration/qa/M2.3');

test('top-bar controls preserve persistence, routing, and responsive search behavior', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:4173/home/overview', {
    waitUntil: 'domcontentloaded',
  });
  await page.getByRole('banner').waitFor();
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Ahmad Al Osaimi' })).toHaveText(
    'AA',
  );

  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ink');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ink');
  await page.getByRole('button', { name: 'Light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper');

  await page.getByRole('button', { name: 'Switch to Arabic' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page
    .getByRole('button', { name: 'التبديل إلى الإنجليزية' })
    .click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

  await page.setViewportSize({ height: 900, width: 760 });
  await expect(page.getByRole('button', { name: 'Search' })).toBeHidden();
});

for (const state of states) {
  for (const width of widths) {
    for (const theme of themes) {
      for (const locale of locales) {
        test(`${state.name} ${String(width)} ${theme} ${locale}`, async ({
          browser,
        }) => {
          const context = await browser.newContext({
            viewport: { height: 900, width },
          });
          const prototype = await context.newPage();
          const application = await context.newPage();
          const comparison = await context.newPage();

          await preparePrototype(prototype, 'dashboard', theme, locale);
          await prepareApplication(
            application,
            '/home/overview',
            theme,
            locale,
          );
          await state.setup?.(prototype, application, locale, width);

          const directory = resolve(evidenceRoot, state.name);
          await mkdir(directory, { recursive: true });
          await captureSideBySide(
            prototype,
            application,
            comparison,
            resolve(directory, `${String(width)}-${theme}-${locale}.png`),
            width,
          );
          await context.close();
        });
      }
    }
  }
}
