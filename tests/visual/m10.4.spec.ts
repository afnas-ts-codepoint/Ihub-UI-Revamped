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

type State = 'company' | 'export-menu' | 'reports' | 'reports-operations';

type Variant = Readonly<{
  locale: QaLocale;
  states: readonly State[];
  theme: QaTheme;
  width: number;
}>;

const allStates: readonly State[] = [
  'company',
  'reports',
  'reports-operations',
  'export-menu',
];

// Reduced matrix (Phase 3 §3.3): 1440 Paper EN, 1440 Ink EN, 1440 Paper AR, 760 Paper EN, 390 Paper EN.
const variants: readonly Variant[] = [
  { locale: 'en', states: allStates, theme: 'paper', width: 1440 },
  { locale: 'en', states: ['company', 'reports'], theme: 'ink', width: 1440 },
  { locale: 'ar', states: allStates, theme: 'paper', width: 1440 },
  { locale: 'en', states: ['company', 'reports', 'reports-operations'], theme: 'paper', width: 760 },
  { locale: 'en', states: ['company', 'reports'], theme: 'paper', width: 390 },
];

const text = {
  company: { ar: 'هذا الربع', en: 'This quarter' },
  export: { ar: /تصدير/, en: /Export/ },
  operations: { ar: 'العمليات', en: 'Operations' },
  placeholder: {
    ar: 'شغّل البحث لإنشاء التقرير',
    en: 'Run search to generate report',
  },
  reportsTab: { ar: 'التحليلات والتقارير', en: 'Analytics & Reports' },
  violations: { ar: 'سجل المخالفات', en: 'Violations Register' },
} as const;

type Surface = 'company' | 'reports';
const surfaceOf = (state: State): Surface => (state === 'company' ? 'company' : 'reports');

async function waitForSurface(page: Page, surface: Surface, locale: QaLocale) {
  if (surface === 'company') {
    await page.getByText(text.company[locale], { exact: true }).first().waitFor();
  } else {
    await page.getByText(text.placeholder[locale]).first().waitFor();
  }
}

async function openPrototype(page: Page, surface: Surface, locale: QaLocale, theme: QaTheme) {
  // The prototype has no Home tab for Company: its only entry is the shared banner's view hook,
  // which switches Home to a view when called from another page (Home itself ignores it).
  await preparePrototype(page, surface === 'company' ? 'history' : 'dashboard', theme, locale);
  if (surface === 'company') {
    await page.evaluate(() => {
      (window as unknown as { __ihubGoToView: (view: string) => void }).__ihubGoToView('company');
    });
  } else {
    await page
      .locator('button')
      .filter({ hasText: text.reportsTab[locale] })
      .first()
      .click();
  }
  await waitForSurface(page, surface, locale);
}

async function openApplication(page: Page, surface: Surface, locale: QaLocale, theme: QaTheme) {
  await prepareApplication(page, `/home/${surface}`, theme, locale);
  await waitForSurface(page, surface, locale);
}

async function drive(page: Page, locale: QaLocale, state: State) {
  switch (state) {
    case 'reports-operations':
      await page.getByRole('button', { name: text.operations[locale], exact: true }).click();
      await page.getByRole('button', { name: text.violations[locale], exact: true }).click();
      break;
    case 'export-menu':
      await page.getByRole('button', { name: text.export[locale] }).click();
      break;
    default:
      break;
  }
  await page.waitForTimeout(700);
}

const evidenceRoot = resolve('docs/migration/qa/M10.4');

for (const variant of variants) {
  for (const state of variant.states) {
    test(`${state} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({ viewport: { height: 1100, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      const surface = surfaceOf(state);

      await Promise.all([
        openPrototype(prototype, surface, variant.locale, variant.theme),
        openApplication(application, surface, variant.locale, variant.theme),
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
