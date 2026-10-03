import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import { captureSideBySide, prepareApplication, type QaLocale, type QaTheme } from './helpers';

const variants = [
  { locale: 'en', theme: 'paper', width: 1440 },
  { locale: 'en', theme: 'ink', width: 1440 },
  { locale: 'ar', theme: 'paper', width: 1440 },
  { locale: 'en', theme: 'paper', width: 760 },
  { locale: 'en', theme: 'paper', width: 390 },
] as const satisfies readonly { locale: QaLocale; theme: QaTheme; width: number }[];

const evidenceRoot = resolve('docs/migration/qa/M11.3');

/** Customised organisation Default: reordered, several widgets hidden, three columns. */
const organization = {
  cols: 3,
  dnd: true,
  hide: true,
  ids: ['metrics', 'highPri', 'slaPerf', 'compliance', 'matrix', 'workload'],
  lock: false,
};
/** A personal layer on top: drops "By matrix partner" and "SLA compliance", two columns. */
const personal = { cols: 2, dnd: true, hide: true, ids: ['metrics', 'highPri', 'slaPerf', 'workload'], lock: false };

async function preparePrototype(page: Page, locale: QaLocale, theme: QaTheme, withPersonal: boolean) {
  await page.addInitScript(
    ({ org, me }) => {
      localStorage.setItem('ihub.taskdash.default', JSON.stringify(org));
      if (me) localStorage.setItem('ihub.taskdash.me', JSON.stringify(me));
    },
    { me: withPersonal ? personal : null, org: organization },
  );
  await page.goto('http://127.0.0.1:4174', { waitUntil: 'domcontentloaded' });
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

async function prepareApp(page: Page, locale: QaLocale, theme: QaTheme, withPersonal: boolean) {
  await page.addInitScript(
    ({ org, me }) => {
      localStorage.setItem(
        'ihub.v2.taskdash.config',
        JSON.stringify({ state: { organizationConfig: org, personalConfig: me }, version: 0 }),
      );
    },
    { me: withPersonal ? personal : null, org: organization },
  );
  await prepareApplication(page, '/home/work-centre/tasks', theme, locale);
  await page.getByRole('button', { name: locale === 'ar' ? 'لوحة المعلومات' : 'Dashboard', exact: true }).click();
  await expect(page.getByTestId('task-dashboard')).toBeVisible();
}

for (const variant of variants) {
  for (const withPersonal of [false, true]) {
    const layer = withPersonal ? 'personal' : 'organization';
    test(`M11.3 ${layer} layout ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({ viewport: { height: 1100, width: variant.width } });
      const application = await context.newPage();
      const prototype = await context.newPage();
      const comparison = await context.newPage();
      await prepareApp(application, variant.locale, variant.theme, withPersonal);
      await preparePrototype(prototype, variant.locale, variant.theme, withPersonal);

      await expect(application.locator('[data-widget-id]')).toHaveCount(withPersonal ? 4 : 6);
      const directory = resolve(evidenceRoot, `${String(variant.width)}-${variant.theme}-${variant.locale}`);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(prototype, application, comparison, resolve(directory, `${layer}-comparison.png`), variant.width, { fullPage: true });
      await context.close();
    });
  }
}

test('M11.3 saving in Settings updates the Tasks dashboard (default, then personal)', async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ viewport: { height: 1100, width: 1440 } });
  const page = await context.newPage();
  await prepareApplication(page, '/settings/configuration', 'paper', 'en');
  await mkdir(evidenceRoot, { recursive: true });

  await page.getByRole('checkbox', { name: 'SLA compliance' }).click();
  await page.getByRole('checkbox', { name: 'By matrix partner' }).click();
  await page.getByRole('radio', { name: /Three columns/ }).click();
  await page.getByRole('button', { name: 'Save configuration' }).click();
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'flow-1-admin-saved.png') });

  await page.getByRole('button', { name: 'User Configuration' }).click();
  await page.getByRole('checkbox', { name: 'By department' }).click();
  await page.getByRole('button', { name: 'Save my layout' }).click();
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'flow-2-personal-saved.png') });

  // A full reload proves persistence; the dashboard reflects both layers.
  await page.goto('http://127.0.0.1:4173/home/work-centre/tasks', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
  const ids = await page.locator('[data-widget-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-widget-id')));
  expect(ids).not.toContain('compliance');
  expect(ids).not.toContain('matrix');
  expect(ids).not.toContain('byDept');
  expect(ids).toContain('workload');
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'flow-3-dashboard-after-reload.png') });
  await context.close();
});
