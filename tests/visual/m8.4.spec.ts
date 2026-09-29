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

const evidenceRoot = resolve('docs/migration/qa/M8.4');

/**
 * Task View has no simple `ihub.route` string it can be reached by (it is
 * opened via `window.__ihubViewTask(item)`, which also needs a specific
 * seeded item object, not just a route). Mirrors M8.3's approach: render the
 * prototype's own exported `TaskViewPage` standalone with a real seeded task
 * pulled from `window.TASKSUI.TASKS`, matching what `readOnly:true` renders
 * in the full app.
 */
async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme) {
  await page.clock.install({ time: new Date('2026-09-25T08:00:00+03:00') });
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('banner').waitFor();
  if (theme === 'ink') {
    await page.getByRole('button', { name: 'Toggle theme' }).click();
  }
  await page.waitForFunction(
    () => typeof (window as typeof window & { TaskViewPage?: unknown }).TaskViewPage === 'function',
  );
  await page.evaluate((qaLocale) => {
    const runtime = window as typeof window & {
      React: { createElement: (type: unknown, props: unknown) => unknown };
      ReactDOM: { createRoot: (element: Element) => { render: (node: unknown) => void } };
      TASKSUI: { TASKS: readonly { id: string }[] };
      TaskViewPage: unknown;
    };
    const main = document.querySelector('main');
    if (!main) throw new Error('Prototype main region was not found');
    main.replaceChildren();
    const host = document.createElement('div');
    host.id = 'm8-4-prototype-host';
    main.append(host);
    const item = runtime.TASKSUI.TASKS[0];
    runtime.ReactDOM.createRoot(host).render(
      runtime.React.createElement(runtime.TaskViewPage, {
        item,
        locale: qaLocale,
        onBack: () => undefined,
        onEdit: () => undefined,
      }),
    );
  }, locale);
  await page.locator('.tep-view-section').waitFor();
}

for (const variant of variants) {
  test(`baseline ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({ viewport: { height: 1400, width: variant.width } });
    const prototype = await context.newPage();
    const application = await context.newPage();
    const comparison = await context.newPage();

    await Promise.all([
      openPrototype(prototype, variant.locale, variant.theme),
      prepareApplication(application, '/tasks/T-001', variant.theme, variant.locale),
    ]);

    await expect(application).toHaveURL(/\/tasks\/T-001$/);
    await expect(application.getByTestId('task-view-page')).toBeVisible();

    // The dependency reminder opens immediately (0ms) in read-only Task View;
    // dismiss it before capturing the underlying page.
    const reminderClose = application.getByRole('dialog').getByRole('button', { name: /Close|إغلاق/ }).last();
    if (await reminderClose.isVisible().catch(() => false)) {
      await reminderClose.click();
    }

    const directory = resolve(evidenceRoot, `${String(variant.width)}-${variant.theme}-${variant.locale}`);
    await mkdir(directory, { recursive: true });
    await application.screenshot({ fullPage: true, path: resolve(directory, 'default.png') });
    await captureSideBySide(
      prototype,
      application,
      comparison,
      resolve(directory, 'default-comparison.png'),
      variant.width,
      { fullPage: true },
    );
    await context.close();
  });
}

test('interaction evidence: dependency reminder and Sub Task History dialog', async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ viewport: { height: 1200, width: 1440 } });
  const application = await context.newPage();
  await prepareApplication(application, '/tasks/T-001', 'paper', 'en');
  await mkdir(evidenceRoot, { recursive: true });

  await expect(application.getByRole('heading', { name: 'Dependency Reminder' })).toBeVisible();
  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'dependency-reminder.png'),
  });
  await application.getByRole('button', { name: 'View dependencies' }).click();
  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'dependencies-highlighted.png'),
  });

  await application.getByRole('button', { name: /Identify Safety Issue/ }).click();
  await expect(application.getByRole('heading', { name: 'Sub Task History' })).toBeVisible();
  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'sub-task-history-timeline.png'),
  });
  await application.getByRole('button', { name: 'Gantt Chart' }).click();
  await expect(application.getByTestId('gantt-chart')).toBeVisible();
  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'sub-task-history-gantt.png'),
  });
  await context.close();
});
