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

type PoSegment = 'history' | 'report' | 'todo';

/** @prototype index.html:L10337-L10341 `poSubDef`. */
const segmentLabels: Record<PoSegment, Readonly<{ ar: string; en: string }>> = {
  history: { ar: 'السجل', en: 'History' },
  report: { ar: 'تقرير', en: 'Report' },
  todo: { ar: 'المهام', en: 'To Do' },
};

const attachLabel = { ar: 'إرفاق أمر الشراء', en: 'Attach Purchase Order' } as const;

async function openPrototypePo(page: Page, locale: QaLocale, theme: QaTheme, segment: PoSegment) {
  await preparePrototype(page, 'dashboard', theme, locale);
  const purchasingTabLabel = locale === 'ar' ? 'المشتريات' : 'Purchasing';
  await page.getByRole('button', { exact: true, name: purchasingTabLabel }).first().click();
  const poTabLabel = locale === 'ar' ? 'أمر الشراء' : 'Purchase Order';
  await page.getByRole('button', { exact: true, name: poTabLabel }).first().click();
  if (segment !== 'todo') {
    // Scoped to `main`: "History"/"السجل" also names an outer global module
    // nav item, which `.first()` would otherwise match instead of this
    // in-page Purchase Order tab.
    await page.getByRole('main').getByRole('button', { exact: true, name: segmentLabels[segment][locale] }).first().click();
  }
}

async function openApplicationPo(page: Page, path: string, theme: QaTheme, locale: QaLocale, segment: PoSegment) {
  await prepareApplication(page, path, theme, locale);
  if (segment !== 'todo') {
    await page.getByRole('main').getByRole('button', { exact: true, name: segmentLabels[segment][locale] }).first().click();
  }
}

async function openAttachDialog(page: Page, locale: QaLocale) {
  await page.getByRole('button', { exact: true, name: attachLabel[locale] }).first().click();
}

type DialogState = 'filled-fields' | 'initial' | 'missing-caption' | 'with-caption';

async function driveAttachDialog(page: Page, locale: QaLocale, dialogState: DialogState) {
  await openAttachDialog(page, locale);
  if (dialogState === 'initial') return;

  const fileChooserPromise = page.waitForEvent('filechooser');
  const uploadLabel = locale === 'ar' ? 'انقر للرفع أو اسحب وأفلت' : 'Click to upload or drag and drop';
  await page.getByText(uploadLabel, { exact: true }).click();
  const chooser = await fileChooserPromise;
  await chooser.setFiles({ buffer: Buffer.from('grn'), mimeType: 'application/pdf', name: 'grn.pdf' });
  if (dialogState === 'missing-caption') return;

  const captionLabel = locale === 'ar' ? 'وصف (مطلوب)…' : 'Caption (required)…';
  await page.getByPlaceholder(captionLabel, { exact: true }).fill(locale === 'ar' ? 'إيصال استلام البضاعة' : 'Goods received note');
  if (dialogState === 'with-caption') return;

  const poNumberPlaceholder = 'PO-2025-000';
  await page.getByPlaceholder(poNumberPlaceholder, { exact: true }).fill('PO-2025-200');
  await page.getByPlaceholder('0.000', { exact: true }).fill('95,100.000');
}

type CaptureState = Readonly<{
  dialog?: DialogState;
  name: string;
  segment: PoSegment;
}>;

const states: readonly CaptureState[] = [
  { name: 'todo', segment: 'todo' },
  { name: 'history', segment: 'history' },
  { name: 'report', segment: 'report' },
  { dialog: 'initial', name: 'attach-dialog-initial', segment: 'todo' },
  { dialog: 'missing-caption', name: 'attach-dialog-missing-caption', segment: 'todo' },
  { dialog: 'with-caption', name: 'attach-dialog-with-caption', segment: 'todo' },
  { dialog: 'filled-fields', name: 'attach-dialog-filled-fields', segment: 'todo' },
];

const evidenceRoot = resolve('docs/migration/qa/M6.4');

for (const state of states) {
  for (const variant of variants) {
    test(`${state.name} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      const viewportHeight = state.dialog ? 1500 : 1100;
      const context = await browser.newContext({ viewport: { height: viewportHeight, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await Promise.all([
        openPrototypePo(prototype, variant.locale, variant.theme, state.segment),
        openApplicationPo(application, '/home/purchasing/po', variant.theme, variant.locale, state.segment),
      ]);

      if (state.dialog) {
        await Promise.all([
          driveAttachDialog(prototype, variant.locale, state.dialog),
          driveAttachDialog(application, variant.locale, state.dialog),
        ]);
      }

      // M6.5 makes Supplier Quotations reachable in the integrated Purchasing shell.
      const quotationsLabel = variant.locale === 'ar' ? 'عروض الموردين' : 'Supplier Quotations';
      await expect(application.getByText(quotationsLabel, { exact: true })).toHaveCount(1);

      await prototype.waitForTimeout(400);
      await application.waitForTimeout(400);
      const directory = resolve(evidenceRoot, state.name);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(prototype, application, comparison, resolve(directory, `${String(variant.width)}-${variant.theme}-${variant.locale}.png`), variant.width, { fullPage: true });
      await context.close();
    });
  }
}
