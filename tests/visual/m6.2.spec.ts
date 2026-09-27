import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import { captureSideBySide, prepareApplication, preparePrototype, type QaLocale, type QaTheme } from './helpers';

const variants = [
  { locale: 'en', theme: 'paper', width: 1440 },
  { locale: 'en', theme: 'ink', width: 1440 },
  { locale: 'ar', theme: 'paper', width: 1440 },
  { locale: 'en', theme: 'paper', width: 760 },
  { locale: 'en', theme: 'paper', width: 390 },
] as const satisfies readonly { locale: QaLocale; theme: QaTheme; width: number }[];

const states = [
  { appPath: '/home/budgets', name: 'default-sheet', prototypeIndex: 0 },
  { appPath: '/home/budgets/sheet', name: 'sheet', prototypeIndex: 0 },
  { appPath: '/home/budgets/activities', name: 'activities', prototypeIndex: 1 },
  { appPath: '/home/budgets/new-budget', name: 'new-budget', prototypeIndex: 2 },
  { appPath: '/home/budgets/additional-budget', name: 'additional-budget', prototypeIndex: 3 },
  { appPath: '/home/budgets/transfer-fund', name: 'transfer-fund', prototypeIndex: 4 },
  { appPath: '/home/budgets/report', name: 'report', prototypeIndex: 5 },
] as const;

const evidenceRoot = resolve('docs/migration/qa/M6.2');

async function openPrototypeBudgeting(page: Page, locale: QaLocale, theme: QaTheme, sectionIndex: number) {
  await preparePrototype(page, 'dashboard', theme, locale);
  const budgetsLabel = locale === 'ar' ? 'الميزانيات' : 'Budgets';
  await page.getByRole('button', { exact: true, name: budgetsLabel }).first().click();
  const sectionBar = page.locator('main div:has(> button:nth-child(6):last-child)').first();
  await sectionBar.locator(':scope > button').nth(sectionIndex).click();
  await expect(sectionBar.locator(':scope > button').nth(sectionIndex)).toHaveCSS('font-weight', '600');
}

for (const state of states) {
  for (const variant of variants) {
    test(`${state.name} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { height: 1000, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await Promise.all([
        openPrototypeBudgeting(prototype, variant.locale, variant.theme, state.prototypeIndex),
        prepareApplication(application, state.appPath, variant.theme, variant.locale),
      ]);
      await expect(prototype.getByText('Projected vs Actual Revenue')).toHaveCount(0);
      await expect(application.getByText('Projected vs Actual Revenue')).toHaveCount(0);
      await prototype.waitForTimeout(500);
      await application.waitForTimeout(500);
      const directory = resolve(evidenceRoot, state.name);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(prototype, application, comparison, resolve(directory, `${String(variant.width)}-${variant.theme}-${variant.locale}.png`), variant.width, { fullPage: true });
      await context.close();
    });
  }
}
