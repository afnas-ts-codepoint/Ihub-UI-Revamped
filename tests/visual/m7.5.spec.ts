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

type State = 'compensate' | 'detail' | 'feedback' | 'list' | 'report';

const labels = {
  compensate: { ar: 'تعويض', en: 'Compensate' },
  edit: { ar: 'تعديل التقرير', en: 'Edit report' },
  feedback: { ar: 'كتابة ملاحظة', en: 'Write feedback' },
  incidents: { ar: /^الحوادث/, en: /^Incidents/ },
  list: { ar: 'قائمة الحوادث', en: 'Incident Listing' },
} as const;

async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme) {
  await preparePrototype(page, 'dashboard', theme, locale);
  await page.getByRole('main').getByRole('button', { name: labels.incidents[locale] }).first().click();
  await page.getByRole('main').getByRole('button', { exact: true, name: labels.list[locale] }).waitFor();
}

async function openApplication(page: Page, locale: QaLocale, theme: QaTheme) {
  await prepareApplication(page, '/home/incidents/reports', theme, locale);
  await page.getByRole('main').getByRole('button', { exact: true, name: labels.list[locale] }).waitFor();
}

async function setState(page: Page, locale: QaLocale, state: State) {
  if (state === 'report') return;
  await page.getByRole('main').getByRole('button', { exact: true, name: labels.list[locale] }).click();
  await page.getByRole('main').getByRole('table').waitFor();
  if (state === 'list') return;

  if (state === 'detail') {
    await page.getByRole('main').getByRole('button', { name: new RegExp(`^${labels.edit[locale]}`) }).first().click();
  } else {
    await page.getByRole('table').getByRole('button', { name: /^Actions|^الإجراءات/ }).first().click();
    const menuItems = page.getByRole('menuitem');
    const actionIndex = state === 'compensate' ? 1 : 4;
    if (await menuItems.count()) {
      await menuItems.nth(actionIndex).click();
    } else {
      await page.getByRole('table').getByRole('button').filter({ hasText: /.+/ }).nth(actionIndex).click();
    }
  }
  await page.waitForTimeout(300);
}

const states: readonly State[] = ['report', 'list', 'detail', 'compensate', 'feedback'];
const evidenceRoot = resolve('docs/migration/qa/M7.5');

for (const state of states) {
  for (const variant of variants) {
    test(`${state} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({
        viewport: { height: state === 'report' ? 1500 : 1100, width: variant.width },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await Promise.all([
        openPrototype(prototype, variant.locale, variant.theme),
        openApplication(application, variant.locale, variant.theme),
      ]);
      await Promise.all([
        setState(prototype, variant.locale, state),
        setState(application, variant.locale, state),
      ]);

      if (state === 'report') {
        await expect(application.getByRole('heading', { name: /Incident Report|تقرير حادث/ })).toBeVisible();
      } else if (state === 'list') {
        await expect(application.getByRole('table')).toContainText('INC-2041');
      } else {
        await expect(application.getByRole('dialog')).toBeVisible();
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
