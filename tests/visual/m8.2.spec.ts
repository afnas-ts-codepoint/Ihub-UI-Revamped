import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

import { captureSideBySide, prepareApplication, type QaLocale, type QaTheme } from './helpers';

const variants = [
  { locale: 'en', theme: 'paper', width: 1440 },
  { locale: 'en', theme: 'ink', width: 1440 },
  { locale: 'ar', theme: 'paper', width: 1440 },
  { locale: 'en', theme: 'paper', width: 760 },
  { locale: 'en', theme: 'paper', width: 390 },
] as const satisfies readonly { locale: QaLocale; theme: QaTheme; width: number }[];

const evidenceRoot = resolve('docs/migration/qa/M8.2');

async function prepareCurrentPrototype(page: import('@playwright/test').Page, locale: QaLocale, theme: QaTheme) {
  await page.goto('http://127.0.0.1:4174', { waitUntil: 'domcontentloaded' });
  await page.locator('body').waitFor();
  await page.getByRole('button', { name: 'Work Centre', exact: true }).click();
  await page.getByRole('button', { name: 'Tasks', exact: true }).click();
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
  if (locale === 'ar') {
    await page.evaluate(() => { window.postMessage({ type: '__activate_edit_mode' }, '*'); });
    await page.getByRole('button', { name: 'العربية' }).click();
    await page.evaluate(() => { window.postMessage({ type: '__deactivate_edit_mode' }, '*'); });
  }
  if (theme === 'ink') await page.getByRole('button', { name: 'Toggle theme' }).click();
}

for (const variant of variants) {
  test(`M8.2 visual evidence ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({ viewport: { height: 1100, width: variant.width } });
    const application = await context.newPage();
    const prototype = await context.newPage();
    const comparison = await context.newPage();

    await prepareApplication(application, '/home/work-centre/tasks', variant.theme, variant.locale);
    await application.getByRole('button', { name: variant.locale === 'ar' ? 'لوحة المعلومات' : 'Dashboard', exact: true }).click();
    await prepareCurrentPrototype(prototype, variant.locale, variant.theme);

    await expect(application.getByTestId('task-dashboard')).toBeVisible();
    await expect(application.locator('[data-widget-id]')).toHaveCount(11);
    const directory = resolve(evidenceRoot, `${String(variant.width)}-${variant.theme}-${variant.locale}`);
    await mkdir(directory, { recursive: true });
    await application.screenshot({ fullPage: true, path: resolve(directory, 'dashboard.png') });
    await captureSideBySide(prototype, application, comparison, resolve(directory, 'dashboard-comparison.png'), variant.width, { fullPage: true });

    if (variant.width === 1440 && variant.theme === 'paper' && variant.locale === 'en') {
      await application.getByTitle('View details — Thrill Rides').click();
      await application.screenshot({ fullPage: true, path: resolve(directory, 'impacted-area-drill.png') });
      await application.getByRole('button', { name: 'Open workload details for IT' }).click();
      await application.screenshot({ fullPage: true, path: resolve(directory, 'workload-gantt.png') });
      await application.getByRole('button', { name: 'Employee', exact: true }).click();
      await application.screenshot({ fullPage: true, path: resolve(directory, 'workload-employees.png') });
    }
    await context.close();
  });
}
