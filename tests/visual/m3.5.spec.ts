import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { test, type Page } from '@playwright/test';

import {
  captureSideBySide,
  prepareApplication,
  preparePrototype,
  type QaLocale,
  type QaTheme,
} from './helpers';

const variants: readonly Readonly<{
  locale: QaLocale;
  theme: QaTheme;
  width: number;
}>[] = [
  { width: 1440, theme: 'paper', locale: 'en' },
  { width: 1440, theme: 'ink', locale: 'en' },
  { width: 1440, theme: 'paper', locale: 'ar' },
  { width: 760, theme: 'paper', locale: 'en' },
  { width: 390, theme: 'paper', locale: 'en' },
];

const states = [
  'section',
  'other-tab',
  'filter-dialog',
  'filter-applied',
  'report',
] as const;
const evidenceRoot = resolve('docs/migration/qa/M3.5');

async function applyState(
  page: Page,
  state: (typeof states)[number],
  locale: QaLocale,
) {
  if (state === 'other-tab') {
    await page.locator('button').filter({ hasText: 'Other Checklist' }).click();
  }
  if (state === 'filter-dialog') {
    const label = locale === 'ar' ? 'المرشّحات' : 'Filters';
    await page.getByRole('button', { name: label }).click();
  }
  if (state === 'filter-applied') {
    await page.getByPlaceholder(/AS-2026-114/).fill('CHK-0421');
  }
  if (state === 'report') {
    const label = locale === 'ar' ? 'تقرير' : 'Report';
    await page.getByRole('button', { name: label, exact: true }).click();
    await page
      .getByRole('heading', { name: locale === 'ar' ? /تقرير/ : /Report/ })
      .waitFor();
  }
}

for (const state of states) {
  for (const { locale, theme, width } of variants) {
    test(`${state} ${String(width)} ${theme} ${locale}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { height: 900, width },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await preparePrototype(prototype, 'checklist', theme, locale);
      await prepareApplication(application, '/quality', theme, locale);
      await Promise.all([
        prototype.locator('table').first().waitFor(),
        application.locator('table').first().waitFor(),
      ]);
      await Promise.all([
        applyState(prototype, state, locale),
        applyState(application, state, locale),
      ]);

      const directory = resolve(evidenceRoot, state);
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
