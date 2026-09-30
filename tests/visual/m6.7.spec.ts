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
  addAnother: { ar: 'إضافة طلب آخر', en: 'Add another request' },
  edit: { ar: 'تعديل', en: 'Edit' },
  editPettyCash: { ar: 'تعديل النثرية', en: 'Edit Petty Cash' },
  history: { ar: 'السجل', en: 'History' },
  listing: { ar: 'قائمة النثرية', en: 'Petty Cash Listing' },
  paymentSettlement: { ar: 'تسوية المدفوعات', en: 'Payment settlement' },
  pettyCash: { ar: 'النثرية', en: 'Petty Cash' },
  reimburse: { ar: 'استرداد النثرية', en: 'Reimburse Petty Cash' },
  settle: { ar: 'تسوية النثرية', en: 'Settle Petty Cash' },
  submitRequest: { ar: 'إرسال الطلب', en: 'Submit request' },
} as const;

type StateName =
  | 'reimburse-edit'
  | 'reimburse-history'
  | 'reimburse-listing'
  | 'reimburse-request'
  | 'request-create'
  | 'request-edit'
  | 'request-error'
  | 'request-history'
  | 'request-multi'
  | 'request-success'
  | 'settle';

const main = (page: Page) => page.getByRole('main');
const button = (page: Page, name: string) => main(page).getByRole('button', { exact: true, name }).first();

async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme) {
  await preparePrototype(page, 'dashboard', theme, locale);
  await page.getByRole('button', { exact: true, name: L.paymentSettlement[locale] }).first().click();
  await button(page, L.pettyCash[locale]).click();
}

async function openApplication(page: Page, locale: QaLocale, theme: QaTheme) {
  await prepareApplication(page, '/home/payment-settlement/petty-cash', theme, locale);
}

async function drive(page: Page, locale: QaLocale, state: StateName) {
  const click = (key: keyof typeof L) => button(page, L[key][locale]).click();
  switch (state) {
    case 'request-create':
      return;
    case 'request-success':
      await click('submitRequest');
      return;
    case 'request-multi':
    case 'request-error': {
      await click('addAnother');
      const amounts = main(page).locator('input[type="number"]');
      await amounts.nth(0).fill('10.5');
      await amounts.nth(1).fill('4');
      if (state === 'request-error') {
        await main(page).locator('input[type="file"]').first().setInputFiles({ buffer: Buffer.from('x'), mimeType: 'application/pdf', name: 'receipt.pdf' });
        await click('submitRequest');
      }
      return;
    }
    case 'request-edit':
      await click('editPettyCash');
      return;
    case 'request-history':
      await click('history');
      return;
    case 'settle':
      await click('settle');
      return;
    default:
      await click('reimburse');
      if (state === 'reimburse-request') return;
      await click(state === 'reimburse-listing' ? 'listing' : state === 'reimburse-edit' ? 'edit' : 'history');
  }
}

const states: readonly StateName[] = [
  'request-create',
  'request-multi',
  'request-error',
  'request-success',
  'request-edit',
  'request-history',
  'reimburse-request',
  'reimburse-listing',
  'reimburse-edit',
  'reimburse-history',
  'settle',
];

const evidenceRoot = resolve('docs/migration/qa/M6.7');

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
