import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { test, type Page } from '@playwright/test';

import { captureSideBySide, prepareApplication, preparePrototype, type QaLocale, type QaTheme } from './helpers';

const variants = [
  { locale: 'en', theme: 'paper', width: 1440 },
  { locale: 'en', theme: 'ink', width: 1440 },
  { locale: 'ar', theme: 'paper', width: 1440 },
  { locale: 'en', theme: 'paper', width: 760 },
  { locale: 'en', theme: 'paper', width: 390 },
] as const satisfies readonly { locale: QaLocale; theme: QaTheme; width: number }[];

type Segment = 'history' | 'report' | 'todo';
const labels = {
  addQuotation: { ar: 'إضافة عرض', en: 'Add Quotation' },
  history: { ar: 'السجل', en: 'History' },
  quotations: { ar: 'عروض الموردين', en: 'Supplier Quotations' },
  report: { ar: 'تقرير', en: 'Report' },
} as const;

async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme, segment: Segment) {
  await preparePrototype(page, 'dashboard', theme, locale);
  await page.getByRole('button', { exact: true, name: locale === 'ar' ? 'المشتريات' : 'Purchasing' }).first().click();
  await page.getByRole('button', { exact: true, name: labels.quotations[locale] }).first().click();
  // Scoped to `main`: "History"/"السجل" also names an outer global module nav
  // item, which `.first()` would otherwise match instead of this in-page tab
  // (this silently produced wrong-page evidence for the `history` state
  // before this fix — see the M6.5 verification pass findings).
  if (segment !== 'todo') await page.getByRole('main').getByRole('button', { exact: true, name: labels[segment][locale] }).first().click();
}

async function openApplication(page: Page, locale: QaLocale, theme: QaTheme, segment: Segment) {
  await prepareApplication(page, '/home/purchasing/quotations', theme, locale);
  if (segment !== 'todo') await page.getByRole('main').getByRole('button', { exact: true, name: labels[segment][locale] }).first().click();
}

type BuilderState = 'initial' | 'multiple' | 'post-h';

async function driveBuilder(page: Page, locale: QaLocale, state: BuilderState) {
  await page.getByRole('button', { name: labels.addQuotation[locale] }).first().click();
  if (state === 'initial') return;
  const addPattern = locale === 'ar' ? /إضافة مورّد/ : /Add supplier/;
  const additions = state === 'multiple' ? 2 : 8;
  for (let index = 0; index < additions; index += 1) await page.getByRole('button', { name: addPattern }).last().click();
}

const states: readonly { builder?: BuilderState; name: string; segment: Segment }[] = [
  { name: 'todo', segment: 'todo' },
  { name: 'history', segment: 'history' },
  { name: 'report', segment: 'report' },
  { builder: 'initial', name: 'builder-initial', segment: 'todo' },
  { builder: 'multiple', name: 'builder-multiple', segment: 'todo' },
  { builder: 'post-h', name: 'builder-post-h-undefined', segment: 'todo' },
];

const evidenceRoot = resolve('docs/migration/qa/M6.5');

for (const state of states) {
  for (const variant of variants) {
    test(`${state.name} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { height: state.builder ? 1600 : 1100, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await Promise.all([
        openPrototype(prototype, variant.locale, variant.theme, state.segment),
        openApplication(application, variant.locale, variant.theme, state.segment),
      ]);
      if (state.builder) await Promise.all([driveBuilder(prototype, variant.locale, state.builder), driveBuilder(application, variant.locale, state.builder)]);
      await prototype.waitForTimeout(300);
      await application.waitForTimeout(300);
      const directory = resolve(evidenceRoot, state.name);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(prototype, application, comparison, resolve(directory, `${String(variant.width)}-${variant.theme}-${variant.locale}.png`), variant.width, { fullPage: true });
      await context.close();
    });
  }
}
