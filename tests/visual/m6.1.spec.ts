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

const states: readonly Readonly<{
  appPath: string;
  name: string;
  prototypeRoute: string;
  subView?: number;
}>[] = [
  { name: 'dashboard-root', prototypeRoute: 'budgeting', appPath: '/finance' },
  {
    name: 'dashboard-route',
    prototypeRoute: 'budgeting/dashboard',
    appPath: '/finance/dashboard',
  },
  {
    name: 'balance-report',
    prototypeRoute: 'budgeting/budgeting',
    appPath: '/finance/budgeting',
    subView: 0,
  },
  {
    name: 'ceo-payment-approval',
    prototypeRoute: 'budgeting/budgeting',
    appPath: '/finance/budgeting',
    subView: 1,
  },
  {
    name: 'pre-approved-listing',
    prototypeRoute: 'budgeting/budgeting',
    appPath: '/finance/budgeting',
    subView: 2,
  },
  {
    name: 'on-hold-partial',
    prototypeRoute: 'budgeting/budgeting',
    appPath: '/finance/budgeting',
    subView: 3,
  },
  {
    name: 'rejected-listing',
    prototypeRoute: 'budgeting/budgeting',
    appPath: '/finance/budgeting',
    subView: 4,
  },
  {
    name: 'history',
    prototypeRoute: 'budgeting/budgeting',
    appPath: '/finance/budgeting',
    subView: 5,
  },
];

const evidenceRoot = resolve('docs/migration/qa/M6.1');

async function selectSubView(
  prototype: Page,
  application: Page,
  index: number,
) {
  const prototypeGroup = prototype
    .locator('main div:has(> button:nth-child(6):last-child)')
    .first();
  const applicationGroup = application
    .locator('[role="tablist"]:has(> [role="tab"]:nth-child(6):last-child)')
    .first();

  await Promise.all([
    prototypeGroup.locator(':scope > button').nth(index).click(),
    applicationGroup.locator(':scope > [role="tab"]').nth(index).click(),
  ]);
  await expect(
    applicationGroup.locator(':scope > [role="tab"]').nth(index),
  ).toHaveAttribute('aria-selected', 'true');
}

for (const state of states) {
  for (const { locale, theme, width } of variants) {
    test(`${state.name} ${String(width)} ${theme} ${locale}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { height: 900, width },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await preparePrototype(prototype, state.prototypeRoute, theme, locale);
      await prepareApplication(application, state.appPath, theme, locale);

      if (state.subView !== undefined) {
        await selectSubView(prototype, application, state.subView);
      }

      await expect(
        prototype.getByText('Projected vs Actual Revenue'),
      ).toHaveCount(0);
      await expect(
        application.getByText('Projected vs Actual Revenue'),
      ).toHaveCount(0);
      await prototype.waitForTimeout(1_000);
      await application.waitForTimeout(1_000);

      const directory = resolve(evidenceRoot, state.name);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(
        prototype,
        application,
        comparison,
        resolve(directory, `${String(width)}-${theme}-${locale}.png`),
        width,
        { fullPage: true },
      );
      await context.close();
    });
  }
}
