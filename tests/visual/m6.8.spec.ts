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

const L = {
  addSupplier: { ar: 'إضافة مورّد', en: 'Add a Supplier' },
  paymentSettlement: { ar: 'تسوية المدفوعات', en: 'Payment settlement' },
  submit: { ar: 'إضافة المورّد', en: 'Add supplier' },
} as const;

type StateName = 'attachment' | 'default' | 'error' | 'success';

const main = (page: Page) => page.getByRole('main');
const button = (page: Page, name: string) => main(page).getByRole('button', { exact: true, name }).first();

async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme) {
  await preparePrototype(page, 'dashboard', theme, locale);
  await page.getByRole('button', { exact: true, name: L.paymentSettlement[locale] }).first().click();
  await button(page, L.addSupplier[locale]).click();
}

async function openApplication(page: Page, locale: QaLocale, theme: QaTheme) {
  await prepareApplication(page, '/home/payment-settlement/add-supplier', theme, locale);
}

async function drive(page: Page, locale: QaLocale, state: StateName) {
  if (state === 'default') return;
  if (state === 'success') {
    await button(page, L.submit[locale]).click();
    return;
  }
  await main(page).locator('input[type="file"]').first().setInputFiles({ buffer: Buffer.from('x'), mimeType: 'application/pdf', name: 'trade-licence.pdf' });
  if (state === 'error') await button(page, L.submit[locale]).click();
}

const states: readonly StateName[] = ['default', 'attachment', 'error', 'success'];
const evidenceRoot = resolve('docs/migration/qa/M6.8');

for (const state of states) {
  for (const variant of variants) {
    test(`${state} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { height: 1100, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await Promise.all([openPrototype(prototype, variant.locale, variant.theme), openApplication(application, variant.locale, variant.theme)]);
      await Promise.all([drive(prototype, variant.locale, state), drive(application, variant.locale, state)]);
      await prototype.waitForTimeout(300);
      await application.waitForTimeout(300);
      const directory = resolve(evidenceRoot, state);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(prototype, application, comparison, resolve(directory, `${String(variant.width)}-${variant.theme}-${variant.locale}.png`), variant.width, { fullPage: true });
      await context.close();
    });
  }
}
