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

const tabs = [
  'Routing Rules',
  'Operational Flow',
  'Auto-Routing · TX',
  'SLA & Escalation',
] as const;

async function normalizedRows(page: Page) {
  return page.locator('table').first().locator('tr').evaluateAll((rows) =>
    rows.map((row) =>
      [...row.querySelectorAll('th,td')].map((cell) =>
        cell.textContent.replace(/\s+/g, ' ').trim(),
      ),
    ),
  );
}

test('default rules and expansion match the prototype', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { height: 900, width: 1440 } });
  const prototype = await context.newPage();
  const application = await context.newPage();
  await Promise.all([
    preparePrototype(prototype, 'workflows', 'paper', 'en'),
    prepareApplication(application, '/workflows', 'paper', 'en'),
  ]);
  await Promise.all([
    prototype.locator('table').first().waitFor(),
    application.locator('table').first().waitFor(),
  ]);
  for (const label of tabs) {
    await expect(prototype.getByText(label, { exact: true })).toBeVisible();
    await expect(application.getByText(label, { exact: true })).toBeVisible();
  }
  expect(await normalizedRows(application)).toEqual(await normalizedRows(prototype));
  await expect(application.getByText('Published workflow · v3.2')).toBeVisible();
  await context.close();
});

type State = 'auto' | 'flow' | 'report' | 'rules' | 'sla';

const states: readonly State[] = ['rules', 'flow', 'auto', 'sla', 'report'];
const variants: readonly Readonly<{ locale: QaLocale; theme: QaTheme; width: number }>[] = [
  { width: 1440, theme: 'paper', locale: 'en' },
  { width: 1440, theme: 'ink', locale: 'en' },
  { width: 1440, theme: 'paper', locale: 'ar' },
  { width: 760, theme: 'paper', locale: 'en' },
  { width: 390, theme: 'paper', locale: 'en' },
];

const labels = {
  en: {
    auto: 'Auto-Routing · TX',
    flow: 'Operational Flow',
    report: 'Report',
    rules: 'Routing Rules',
    sla: 'SLA & Escalation',
  },
  ar: {
    auto: 'التوجيه التلقائي · التجربة',
    flow: 'سير العمل التشغيلي',
    report: 'تقرير',
    rules: 'قواعد التوجيه',
    sla: 'المهل والتصعيد',
  },
} as const;

async function applyState(page: Page, state: State, locale: QaLocale) {
  const label = labels[locale][state];
  if (state === 'report') {
    await page.getByText(label, { exact: true }).first().click();
    await page.locator('h2').first().waitFor();
    return;
  }
  if (state !== 'rules') {
    await page.getByText(label, { exact: true }).click();
  }
  if (state === 'rules' || state === 'sla') await page.locator('table').first().waitFor();
  if (state === 'flow') await page.getByText(locale === 'ar' ? 'المدة الإجمالية' : 'Target end-to-end').waitFor();
  if (state === 'auto') await page.getByText(locale === 'ar' ? 'إشادة ضيف' : 'Guest Compliment').waitFor();
}

const evidenceRoot = resolve('docs/migration/qa/M3.7');

for (const state of states) {
  for (const { locale, theme, width } of variants) {
    test(`capture ${state} ${String(width)} ${theme} ${locale}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { height: 900, width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await Promise.all([
        preparePrototype(prototype, 'workflows', theme, locale),
        prepareApplication(application, '/workflows', theme, locale),
      ]);
      await Promise.all([
        applyState(prototype, state, locale),
        applyState(application, state, locale),
      ]);
      const directory = resolve(evidenceRoot, state);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(
        prototype,
        application,
        comparison,
        resolve(directory, `${String(width)}-${theme}-${locale}.png`),
        width,
      );
      await context.close();
    });
  }
}
