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

type State = 'converted' | 'dialog';

const labels = {
  actions: { ar: 'الإجراءات', en: 'Actions' },
  create: { ar: 'إنشاء المهمة', en: 'Create task' },
  createApplication: { ar: 'إنشاء مهمة', en: 'Create task' },
  incidents: { ar: /^الحوادث/, en: /^Incidents/ },
  list: { ar: 'قائمة الحوادث', en: 'Incident Listing' },
  raise: { ar: 'إنشاء مهمة', en: 'Raise a task' },
} as const;

async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme) {
  await preparePrototype(page, 'dashboard', theme, locale);
  await page.getByRole('main').getByRole('button', { name: labels.incidents[locale] }).first().click();
  await page.getByRole('main').getByRole('button', { exact: true, name: labels.list[locale] }).click();
  await page.getByRole('main').getByRole('table').waitFor();
}

async function openApplication(page: Page, locale: QaLocale, theme: QaTheme) {
  await prepareApplication(page, '/home/incidents/reports', theme, locale);
  await page.getByRole('main').getByRole('button', { exact: true, name: labels.list[locale] }).click();
  await page.getByRole('main').getByRole('table').waitFor();
}

async function raisePrototype(page: Page, locale: QaLocale, state: State) {
  await page.getByRole('table').getByTitle(labels.actions[locale]).first().click();
  await page.getByRole('button', { name: labels.raise[locale] }).first().click();
  await page.waitForTimeout(400);
  if (state === 'converted') {
    await page.getByRole('button', { name: labels.create[locale] }).click();
    await page.waitForTimeout(300);
  }
}

async function raiseApplication(page: Page, locale: QaLocale, state: State) {
  await page.getByRole('table').getByRole('button', { name: new RegExp(`^${labels.actions[locale]} INC-2041`) }).click();
  await page.getByRole('menuitem', { name: labels.raise[locale] }).click();
  const dialog = page.getByRole('dialog', { name: labels.raise[locale] });
  await expect(dialog).toBeVisible();
  if (state === 'converted') {
    await dialog.getByRole('button', { name: labels.createApplication[locale] }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(/TSK-2026-318/).first()).toBeVisible();
  }
  await page.waitForTimeout(300);
}

const states: readonly State[] = ['dialog', 'converted'];
const evidenceRoot = resolve('docs/migration/qa/M9.2');

for (const state of states) {
  for (const variant of variants) {
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
        raisePrototype(prototype, variant.locale, state),
        raiseApplication(application, variant.locale, state),
      ]);

      if (variant.locale === 'ar') {
        await expect(application.locator('html')).toHaveAttribute('dir', 'rtl');
      }
      // No horizontal page scroll at any width.
      const overflow = await application.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);

      const directory = resolve(evidenceRoot, state);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(
        prototype,
        application,
        comparison,
        resolve(directory, `${String(variant.width)}-${variant.theme}-${variant.locale}.png`),
        variant.width,
      );
      await context.close();
    });
  }
}
