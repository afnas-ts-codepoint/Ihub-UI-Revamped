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
  { locale: 'en', theme: 'ink', width: 1440 },
  { locale: 'ar', theme: 'paper', width: 1440 },
  { locale: 'en', theme: 'paper', width: 760 },
  { locale: 'en', theme: 'paper', width: 390 },
] as const satisfies readonly {
  locale: QaLocale;
  theme: QaTheme;
  width: number;
}[];

type State =
  | 'add-initial'
  | 'add-attachment-missing'
  | 'add-attachment-valid'
  | 'assignment'
  | 'history'
  | 'report';

const labels = {
  assignment: { ar: 'تعديل إسناد الملاحظات', en: 'Edit Assignment Observations' },
  history: { ar: 'السجل', en: 'History' },
  observations: { ar: 'الملاحظات', en: 'Observations' },
  report: { ar: 'تقرير', en: 'Report' },
  submit: { ar: 'إرسال الملاحظة', en: 'Submit observation' },
  workCentre: { ar: 'مركز العمل', en: 'Work Centre' },
} as const;

const appPaths: Record<State, string> = {
  'add-initial': '/home/work-centre/observations/add',
  'add-attachment-missing': '/home/work-centre/observations/add',
  'add-attachment-valid': '/home/work-centre/observations/add',
  assignment: '/home/work-centre/observations/assignment',
  history: '/home/work-centre/observations/history',
  report: '/home/work-centre/observations/report',
};

async function clickMainButton(page: Page, name: string) {
  await page.getByRole('main').getByRole('button', { exact: true, name }).first().click();
}

async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme, state: State) {
  await preparePrototype(page, 'dashboard', theme, locale);
  await clickMainButton(page, labels.workCentre[locale]);
  await clickMainButton(page, labels.observations[locale]);
  if (state === 'assignment') await clickMainButton(page, labels.assignment[locale]);
  if (state === 'history') await clickMainButton(page, labels.history[locale]);
  if (state === 'report') await clickMainButton(page, labels.report[locale]);
  await setPrototypeState(page, locale, state);
}

async function setPrototypeState(page: Page, locale: QaLocale, state: State) {
  if (state === 'add-initial' || state === 'assignment' || state === 'history' || state === 'report') return;
  if (locale === 'en') {
    await page.getByRole('main').getByRole('button', { exact: true, name: 'High' }).first().click();
    await page.getByRole('main').getByRole('button', { exact: true, name: 'High' }).last().click();
  }
  await page
    .getByRole('button', {
      exact: true,
      name: locale === 'ar' ? 'إضافة مرفق' : 'Add file',
    })
    .click();
  if (state === 'add-attachment-valid') {
    await page
      .getByPlaceholder(locale === 'en' ? 'Caption (required)' : 'الوصف (مطلوب)')
      .fill('Wet floor context');
  }
}

async function setApplicationState(page: Page, locale: QaLocale, state: State) {
  if (state === 'add-initial' || state === 'assignment' || state === 'history' || state === 'report') return;
  await page
    .getByRole('button', {
      name: locale === 'ar' ? 'إضافة مرفق' : 'Add file',
    })
    .click();
  if (state === 'add-attachment-valid') {
    await page
      .getByPlaceholder(locale === 'en' ? 'Caption (required)' : 'الوصف (مطلوب)')
      .fill('Wet floor context');
  }
}

async function openApplication(page: Page, locale: QaLocale, theme: QaTheme, state: State) {
  await prepareApplication(page, appPaths[state], theme, locale);
  await setApplicationState(page, locale, state);
}

const states: readonly State[] = [
  'add-initial',
  'add-attachment-missing',
  'add-attachment-valid',
  'assignment',
  'history',
  'report',
];

const evidenceRoot = resolve('docs/migration/qa/M7.3');

for (const state of states) {
  for (const variant of variants) {
    test(`${state} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({
        viewport: { height: state.startsWith('add-') ? 1500 : 1100, width: variant.width },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await Promise.all([
        openPrototype(prototype, variant.locale, variant.theme, state),
        openApplication(application, variant.locale, variant.theme, state),
      ]);

      if (state.startsWith('add-')) {
        await expect(application.getByRole('button', { name: labels.submit[variant.locale] })).toBeVisible();
      } else if (state === 'history') {
        await expect(application.getByRole('table')).toContainText('REC-2026412');
      } else if (state === 'report') {
        await expect(
          application.getByRole('heading', {
            name: variant.locale === 'ar' ? 'الملاحظات — تقرير' : 'Observations — Report',
          }),
        ).toBeVisible();
      } else {
        await expect(application.getByRole('table')).toBeVisible();
      }

      await prototype.waitForTimeout(300);
      await application.waitForTimeout(300);
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
