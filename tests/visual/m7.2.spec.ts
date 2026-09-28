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

const variants = [
  { locale: 'en', theme: 'paper', width: 1440 },
  { locale: 'ar', theme: 'paper', width: 1440 },
  { locale: 'en', theme: 'paper', width: 390 },
] as const satisfies readonly {
  locale: QaLocale;
  theme: QaTheme;
  width: number;
}[];

type State =
  | 'add-initial'
  | 'add-valid'
  | 'add-attachment-missing'
  | 'add-attachment-valid'
  | 'history';

const labels = {
  enquiry: { ar: 'استفسار', en: 'Enquiry' },
  history: { ar: 'السجل', en: 'History' },
  priority: { ar: 'مرتفعة', en: 'High' },
  subject: { ar: 'الموضوع', en: 'Subject' },
  subjectPlaceholder: {
    ar: 'سطر واحد يوجز الاستفسار',
    en: 'One line summarising the enquiry',
  },
  submit: { ar: 'إرسال الاستفسار', en: 'Submit enquiry' },
  workCentre: { ar: 'مركز العمل', en: 'Work Centre' },
} as const;

const appPaths: Record<State, string> = {
  'add-initial': '/home/work-centre/enquiry/add',
  'add-valid': '/home/work-centre/enquiry/add',
  'add-attachment-missing': '/home/work-centre/enquiry/add',
  'add-attachment-valid': '/home/work-centre/enquiry/add',
  history: '/home/work-centre/enquiry/history',
};

async function clickMainButton(page: Page, name: string) {
  await page.getByRole('main').getByRole('button', { exact: true, name }).first().click();
}

async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme, state: State) {
  await preparePrototype(page, 'dashboard', theme, locale);
  await clickMainButton(page, labels.workCentre[locale]);
  await clickMainButton(page, labels.enquiry[locale]);
  if (state === 'history') await clickMainButton(page, labels.history[locale]);
  await setState(page, locale, state);
}

async function setState(page: Page, locale: QaLocale, state: State) {
  if (state === 'add-initial' || state === 'history') return;
  await page
    .getByPlaceholder(labels.subjectPlaceholder[locale])
    .fill('Attachment review');
  await page.getByRole('button', { exact: true, name: labels.priority[locale] }).click();
  if (state === 'add-attachment-missing' || state === 'add-attachment-valid') {
    await page.locator('input[type="file"]').setInputFiles({
      name: 'evidence.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('evidence'),
    });
    if (state === 'add-attachment-valid') {
      await page
        .getByPlaceholder(locale === 'en' ? 'Caption (required)' : 'الوصف (مطلوب)')
        .fill('Evidence');
    }
  }
}

async function openApplication(page: Page, locale: QaLocale, theme: QaTheme, state: State) {
  await prepareApplication(page, appPaths[state], theme, locale);
  await setState(page, locale, state);
}

const states: readonly State[] = [
  'add-initial',
  'add-valid',
  'add-attachment-missing',
  'add-attachment-valid',
  'history',
];

const evidenceRoot = resolve('docs/migration/qa/M7.2');

for (const state of states) {
  for (const variant of variants) {
    test(`${state} ${String(variant.width)} ${variant.locale}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({
        viewport: { height: 1100, width: variant.width },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await Promise.all([
        openPrototype(prototype, variant.locale, variant.theme, state),
        openApplication(application, variant.locale, variant.theme, state),
      ]);

      if (state === 'history') {
        await expect(application.getByRole('tab', { name: /Open 12/ })).toBeVisible();
        await expect(application.getByRole('table')).toContainText('ENQ-118');
      } else {
        await expect(
          application.getByRole('button', { name: labels.submit[variant.locale] }),
        ).toBeVisible();
      }

      await prototype.waitForTimeout(300);
      await application.waitForTimeout(300);
      const directory = resolve(evidenceRoot, state);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(
        prototype,
        application,
        comparison,
        resolve(directory, `${String(variant.width)}-${variant.locale}.png`),
        variant.width,
        { fullPage: true },
      );
      await context.close();
    });
  }
}
