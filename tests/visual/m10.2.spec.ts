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

type State =
  | 'clock-ontime'
  | 'drawer'
  | 'heatmap-employee'
  | 'heatmap-open'
  | 'incident-search'
  | 'overview'
  | 'tracked';

type Variant = Readonly<{
  locale: QaLocale;
  states: readonly State[];
  theme: QaTheme;
  width: number;
}>;

const allStates: readonly State[] = [
  'overview',
  'clock-ontime',
  'heatmap-open',
  'heatmap-employee',
  'incident-search',
  'drawer',
  'tracked',
];

// Reduced matrix (Phase 3 §3.3): 1440 Paper EN, 1440 Ink EN, 1440 Paper AR, 760 Paper EN, 390 Paper EN.
const variants: readonly Variant[] = [
  { locale: 'en', states: allStates, theme: 'paper', width: 1440 },
  { locale: 'en', states: ['overview', 'clock-ontime', 'heatmap-open'], theme: 'ink', width: 1440 },
  { locale: 'ar', states: allStates, theme: 'paper', width: 1440 },
  { locale: 'en', states: ['overview', 'clock-ontime', 'heatmap-open', 'drawer'], theme: 'paper', width: 760 },
  { locale: 'en', states: ['overview', 'heatmap-open'], theme: 'paper', width: 390 },
  { locale: 'ar', states: ['overview'], theme: 'paper', width: 390 },
];

const text = {
  employee: { ar: 'الموظف', en: 'Employee' },
  heading: { ar: 'يحتاجك الآن', en: 'Needs you now' },
  onTime: { ar: /^في الوقت \d+$/, en: /^On time \d+$/ },
  review: { ar: /مراجعة/, en: /Review/ },
  search: { ar: 'ابحث في الحوادث…', en: 'Search incidents…' },
  workload: {
    ar: 'توافر موارد الإدارات وأعباء العمل',
    en: 'Department resource availability & workload',
  },
} as const;

async function waitForOverview(page: Page, locale: QaLocale) {
  await page.getByText(text.heading[locale], { exact: true }).first().waitFor();
}

async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme) {
  await preparePrototype(page, 'dashboard', theme, locale);
  await waitForOverview(page, locale);
}

async function openApplication(page: Page, locale: QaLocale, theme: QaTheme) {
  await prepareApplication(page, '/home/overview', theme, locale);
  await waitForOverview(page, locale);
}

/** The workload card, by its heading: a `.card` in the prototype, a `section` here. */
const workload = (page: Page, locale: QaLocale) =>
  page.locator('section').filter({ hasText: text.workload[locale] }).last();

async function drive(page: Page, locale: QaLocale, state: State) {
  switch (state) {
    case 'clock-ontime':
      await page.getByRole('button', { name: text.onTime[locale] }).click();
      break;
    case 'heatmap-open': {
      const card = workload(page, locale);
      await card.locator('span', { hasText: /^IT$/ }).first().click();
      break;
    }
    case 'heatmap-employee': {
      const card = workload(page, locale);
      await card.getByRole('button', { name: text.employee[locale], exact: true }).click();
      break;
    }
    case 'incident-search': {
      const field = page.getByPlaceholder(text.search[locale]);
      await field.fill('payments');
      break;
    }
    case 'drawer':
      await page.getByRole('button', { name: text.review[locale] }).first().click();
      break;
    case 'tracked':
      // Pinning an incident adds it to the tracker and the live feed.
      await page
        .locator('[title="Pin to feed"], [aria-label="Pin to feed"]')
        .first()
        .click();
      break;
    default:
      break;
  }
  await page.waitForTimeout(800);
}

const evidenceRoot = resolve('docs/migration/qa/M10.2');

for (const variant of variants) {
  for (const state of variant.states) {
    test(`${state} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({ viewport: { height: 1100, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await Promise.all([
        openPrototype(prototype, variant.locale, variant.theme),
        openApplication(application, variant.locale, variant.theme),
      ]);
      await Promise.all([
        drive(prototype, variant.locale, state),
        drive(application, variant.locale, state),
      ]);

      if (variant.locale === 'ar') {
        await expect(application.locator('html')).toHaveAttribute('dir', 'rtl');
      }
      // No horizontal page scroll at any width.
      const overflow = await application.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);

      const directory = resolve(evidenceRoot, state);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(
        prototype,
        application,
        comparison,
        resolve(directory, `${String(variant.width)}-${variant.theme}-${variant.locale}.png`),
        variant.width,
        { fullPage: true },
      );
      await context.close();
    });
  }
}
