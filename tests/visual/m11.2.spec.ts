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

const evidenceRoot = resolve('docs/migration/qa/M11.2');

const settingsButtonName = { ar: 'الإعدادات والتهيئة', en: 'Settings & Configuration' } as const;
const userTabName = { ar: 'إعدادات المستخدم', en: 'User Configuration' } as const;
const roleScopeName = { ar: /حسب الدور/, en: /Role-based/ } as const;
const deptScopeName = { ar: /الإدارة \/ الفريق/, en: /Department \/ team/ } as const;
const userScopeName = { ar: /مستخدم فردي/, en: /Individual user/ } as const;

async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme) {
  await preparePrototype(page, 'dashboard', theme, locale);
  await page.getByRole('button', { name: settingsButtonName[locale] }).click();
  await page.getByRole('heading', { name: locale === 'ar' ? 'التهيئة' : 'Configuration' }).waitFor();
}

async function openApplication(page: Page, locale: QaLocale, theme: QaTheme) {
  await prepareApplication(page, '/settings/configuration', theme, locale);
  await page.getByTestId('settings-configuration-page').waitFor();
}

for (const variant of variants) {
  test(`baseline admin default scope ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({ viewport: { height: 1400, width: variant.width } });
    const prototype = await context.newPage();
    const application = await context.newPage();
    const comparison = await context.newPage();

    await Promise.all([
      openPrototype(prototype, variant.locale, variant.theme),
      openApplication(application, variant.locale, variant.theme),
    ]);

    const directory = resolve(evidenceRoot, `${String(variant.width)}-${variant.theme}-${variant.locale}`);
    await mkdir(directory, { recursive: true });
    await application.screenshot({ fullPage: true, path: resolve(directory, 'admin-default.png') });
    await captureSideBySide(
      prototype,
      application,
      comparison,
      resolve(directory, 'admin-default-comparison.png'),
      variant.width,
      { fullPage: true },
    );
    await context.close();
  });
}

test('scope switching: Role, Department and Individual user', async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ viewport: { height: 1400, width: 1440 } });
  const prototype = await context.newPage();
  const application = await context.newPage();
  const comparison = await context.newPage();
  await Promise.all([openPrototype(prototype, 'en', 'paper'), openApplication(application, 'en', 'paper')]);
  await mkdir(evidenceRoot, { recursive: true });

  for (const [name, pattern] of [
    ['role', roleScopeName.en],
    ['department', deptScopeName.en],
    ['individual-user', userScopeName.en],
  ] as const) {
    await Promise.all([
      prototype.getByRole('radio', { name: pattern }).click(),
      application.getByRole('radio', { name: pattern }).click(),
    ]);
    await captureSideBySide(
      prototype,
      application,
      comparison,
      resolve(evidenceRoot, `scope-${name}-comparison.png`),
      1440,
      { fullPage: true },
    );
  }
  await context.close();
});

test('User Configuration tab (EN + AR)', async ({ browser }) => {
  test.setTimeout(120_000);
  for (const locale of ['en', 'ar'] as const) {
    const context = await browser.newContext({ viewport: { height: 1400, width: 1440 } });
    const prototype = await context.newPage();
    const application = await context.newPage();
    const comparison = await context.newPage();
    await Promise.all([openPrototype(prototype, locale, 'paper'), openApplication(application, locale, 'paper')]);

    await Promise.all([
      prototype.getByRole('button', { name: userTabName[locale] }).click(),
      application.getByRole('button', { name: userTabName[locale] }).click(),
    ]);
    await mkdir(evidenceRoot, { recursive: true });
    await captureSideBySide(
      prototype,
      application,
      comparison,
      resolve(evidenceRoot, `user-configuration-${locale}-comparison.png`),
      1440,
      { fullPage: true },
    );
    await context.close();
  }
});

test('desktop / tablet / mobile preview toggle', async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ viewport: { height: 1200, width: 1440 } });
  const application = await context.newPage();
  await openApplication(application, 'en', 'paper');
  await mkdir(evidenceRoot, { recursive: true });

  for (const device of ['Desktop', 'Tablet', 'Mobile'] as const) {
    await application.getByRole('button', { name: device, exact: true }).click();
    await application.screenshot({
      fullPage: true,
      path: resolve(evidenceRoot, `preview-${device.toLowerCase()}.png`),
    });
  }
  await context.close();
});

test('widget search, reorder, hide and lock state', async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ viewport: { height: 1400, width: 1440 } });
  const application = await context.newPage();
  await openApplication(application, 'en', 'paper');
  await mkdir(evidenceRoot, { recursive: true });

  // Widget search ("picker") open state.
  await application.getByPlaceholder('Search widgets…').fill('sla');
  await application.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'widget-search-open.png') });
  await application.getByPlaceholder('Search widgets…').fill('');

  // Reorder "SLA compliance" (#3) to the top via native HTML5 drag-and-drop.
  const complianceRow = application.getByRole('checkbox', { name: 'SLA compliance' }).locator('xpath=..');
  const metricsRow = application.getByRole('checkbox', { name: 'Task metrics' }).locator('xpath=..');
  await complianceRow.dragTo(metricsRow);

  // Hide a widget and lock the mandatory widgets.
  await application.getByRole('checkbox', { name: 'By department' }).click();
  await application.getByRole('switch', { name: 'Lock mandatory widgets' }).click();

  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'reordered-hidden-locked.png'),
  });
  await context.close();
});

test('saved-configuration library and JSON import interaction', async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ viewport: { height: 1400, width: 1440 } });
  const application = await context.newPage();
  await openApplication(application, 'en', 'paper');
  await mkdir(evidenceRoot, { recursive: true });

  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'saved-configuration-library.png'),
  });

  await application.getByRole('button', { name: 'Duplicate' }).first().click();
  await expect(application.getByText('Executive dashboard (copy)')).toBeVisible();
  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'saved-configuration-duplicated.png'),
  });

  const [chooser] = await Promise.all([
    application.waitForEvent('filechooser'),
    application.getByRole('button', { name: 'Import' }).click(),
  ]);
  await chooser.setFiles({
    buffer: Buffer.from(
      JSON.stringify({
        config: { cols: 2, dnd: true, hide: true, ids: ['metrics', 'slaPerf', 'byDept'], lock: false },
        scope: 'default',
      }),
    ),
    mimeType: 'application/json',
    name: 'tasks-dashboard-default.json',
  });
  await expect(application.getByRole('status')).toHaveText('Configuration imported — save to apply');
  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'json-import-flash.png'),
  });
  await context.close();
});
