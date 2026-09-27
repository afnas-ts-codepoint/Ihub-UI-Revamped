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

type PurchasingSegment = 'create' | 'edit' | 'history' | 'missing' | 'pending' | 'report' | 'review' | 'todo';

/** @prototype index.html:L10184-L10193 `reqSubDef`; L10535 `pcSub` tab labels. */
const segmentLabels: Record<PurchasingSegment, Readonly<{ ar: string; en: string }>> = {
  create: { ar: 'طلب لجنة المشتريات', en: 'Purchase Committee Request' },
  edit: { ar: 'تعديل الطلب', en: 'Edit PC Request' },
  history: { ar: 'السجل', en: 'History' },
  missing: { ar: 'مستندات ناقصة', en: 'Missing Documents' },
  pending: { ar: 'الطلبات المعلقة', en: 'Pending Requests' },
  report: { ar: 'تقرير', en: 'Report' },
  review: { ar: 'مراجعة طلبات الشراء', en: 'Review Purchase Requests' },
  todo: { ar: 'المهام', en: 'To Do' },
};

const reviewButtonLabel = { ar: 'مراجعة', en: 'Review' } as const;
const supplierOption = 'Nasim Facility Services — 94,500.000 KWD';

async function openPrototypeSegment(page: Page, locale: QaLocale, theme: QaTheme, segment: PurchasingSegment) {
  await preparePrototype(page, 'dashboard', theme, locale);
  const purchasingTabLabel = locale === 'ar' ? 'المشتريات' : 'Purchasing';
  await page.getByRole('button', { exact: true, name: purchasingTabLabel }).first().click();
  const label = segmentLabels[segment][locale];
  await page.getByRole('button', { exact: true, name: label }).first().click();
}

async function openApplicationSegment(page: Page, path: string, theme: QaTheme, locale: QaLocale) {
  await prepareApplication(page, path, theme, locale);
}

async function openReviewDialog(page: Page, locale: QaLocale) {
  await page.getByRole('button', { exact: true, name: reviewButtonLabel[locale] }).first().click();
}

/**
 * The prototype globally patches every native `<select>` into a type-to-search
 * combobox widget (`index.html` lines 50-96: `React.createElement` is patched
 * so `select` becomes a custom `input` + portal listbox). Production keeps a
 * plain native `<select>`, matching the already human-approved M6.2 precedent
 * (`NewBudgetView`'s Location/Zone/Department/etc. selects are also plain
 * native `<select>` elements, not the custom combobox) — this is a known,
 * accepted, visual-only rendering difference, not a fidelity defect.
 */
async function submitReviewDialog(page: Page, locale: QaLocale, kind: 'application' | 'prototype') {
  const submitLabel = locale === 'ar' ? 'إرسال إلى لجنة المشتريات' : 'Submit to purchase committee';
  if (kind === 'application') {
    const supplierLabel = locale === 'ar' ? 'المورّد المرسى عليه' : 'Awarded supplier';
    await page.getByLabel(supplierLabel).selectOption({ label: supplierOption });
  } else {
    const placeholderText = locale === 'ar' ? 'اختر المورّد…' : 'Select supplier…';
    await page.getByPlaceholder(placeholderText, { exact: true }).click();
    await page.getByText(supplierOption, { exact: true }).click();
  }
  await page.getByRole('button', { exact: true, name: submitLabel }).click();
}

type CaptureState = Readonly<{
  appPath: string;
  dialog?: 'open' | 'submitted';
  name: string;
  segment: PurchasingSegment;
}>;

const states: readonly CaptureState[] = [
  { appPath: '/home/purchasing', name: 'default-create', segment: 'create' },
  { appPath: '/home/purchasing/pending', name: 'pending', segment: 'pending' },
  { appPath: '/home/purchasing/edit', name: 'edit', segment: 'edit' },
  { appPath: '/home/purchasing/review', name: 'review-list', segment: 'review' },
  { appPath: '/home/purchasing/review', dialog: 'open', name: 'review-dialog-before-submit', segment: 'review' },
  { appPath: '/home/purchasing/review', dialog: 'submitted', name: 'review-dialog-after-lock', segment: 'review' },
  { appPath: '/home/purchasing/todo', name: 'todo', segment: 'todo' },
  { appPath: '/home/purchasing/missing', name: 'missing', segment: 'missing' },
  { appPath: '/home/purchasing/history', name: 'history', segment: 'history' },
  { appPath: '/home/purchasing/report', name: 'report', segment: 'report' },
];

const evidenceRoot = resolve('docs/migration/qa/M6.3');

for (const state of states) {
  for (const variant of variants) {
    test(`${state.name} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      const viewportHeight = state.dialog ? 1500 : 1100;
      const context = await browser.newContext({ viewport: { height: viewportHeight, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await Promise.all([
        openPrototypeSegment(prototype, variant.locale, variant.theme, state.segment),
        openApplicationSegment(application, state.appPath, variant.theme, variant.locale),
      ]);

      if (state.dialog === 'open' || state.dialog === 'submitted') {
        await openReviewDialog(prototype, variant.locale);
        await openReviewDialog(application, variant.locale);
      }
      if (state.dialog === 'submitted') {
        await submitReviewDialog(prototype, variant.locale, 'prototype');
        await submitReviewDialog(application, variant.locale, 'application');
      }

      // Out of scope for M6.3 — the migrated app must never render PO/Quotations tabs or content.
      await expect(application.getByText('Purchase Order', { exact: true })).toHaveCount(0);
      await expect(application.getByText('Supplier Quotations', { exact: true })).toHaveCount(0);

      await prototype.waitForTimeout(400);
      await application.waitForTimeout(400);
      const directory = resolve(evidenceRoot, state.name);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(prototype, application, comparison, resolve(directory, `${String(variant.width)}-${variant.theme}-${variant.locale}.png`), variant.width, { fullPage: true });
      await context.close();
    });
  }
}
