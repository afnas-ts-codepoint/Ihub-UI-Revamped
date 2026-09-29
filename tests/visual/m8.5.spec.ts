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

const evidenceRoot = resolve('docs/migration/qa/M8.5');

async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme) {
  await page.clock.install({ time: new Date('2026-09-25T08:00:00+03:00') });
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('banner').waitFor();
  if (theme === 'ink') await page.getByRole('button', { name: 'Toggle theme' }).click();
  await page.waitForFunction(
    () => typeof (window as typeof window & { TaskEditPage?: unknown }).TaskEditPage === 'function',
  );
  await page.evaluate((qaLocale) => {
    const runtime = window as typeof window & {
      React: { createElement: (type: unknown, props: unknown) => unknown };
      ReactDOM: { createRoot: (element: Element) => { render: (node: unknown) => void } };
      TASKSUI: { TASKS: readonly { id: string }[] };
      TaskEditPage: unknown;
    };
    const main = document.querySelector('main');
    if (!main) throw new Error('Prototype main region was not found');
    main.replaceChildren();
    const host = document.createElement('div');
    host.id = 'm8-5-prototype-host';
    main.append(host);
    runtime.ReactDOM.createRoot(host).render(
      runtime.React.createElement(runtime.TaskEditPage, {
        item: runtime.TASKSUI.TASKS[0],
        locale: qaLocale,
        onBack: () => undefined,
      }),
    );
  }, locale);
  await page.locator('.tep-edit-section').waitFor();
  await page.waitForTimeout(2100);
  const close = page.locator('button[aria-label="Close"]').last();
  if (await close.isVisible().catch(() => false)) await close.click();
}

async function dismissApplicationReminder(page: Page) {
  await page.waitForTimeout(2100);
  const dialog = page.getByRole('dialog');
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole('button', { name: /Close|إغلاق/ }).last().click();
  }
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
      prepareApplication(application, '/tasks/T-001/edit', variant.theme, variant.locale),
    ]);
    await expect(application.getByTestId('task-edit-page')).toBeVisible();
    await dismissApplicationReminder(application);
    const directory = resolve(evidenceRoot, `${String(variant.width)}-${variant.theme}-${variant.locale}`);
    await mkdir(directory, { recursive: true });
    await application.screenshot({ fullPage: true, path: resolve(directory, 'default.png') });
    await captureSideBySide(prototype, application, comparison, resolve(directory, 'default-comparison.png'), variant.width, { fullPage: true });
    await context.close();
  });
}

test('interaction evidence: SLA, comment, log note, activity and delayed reminder', async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ viewport: { height: 1200, width: 1440 } });
  const page = await context.newPage();
  await prepareApplication(page, '/tasks/T-001/edit', 'paper', 'en');
  await mkdir(evidenceRoot, { recursive: true });

  await expect(page.getByRole('heading', { name: 'Dependency Reminder' })).toBeVisible({ timeout: 5000 });
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'dependency-reminder.png') });
  await page.getByRole('button', { name: 'Close' }).last().click();

  await page.getByRole('button', { name: 'SLA & Performance' }).click();
  await page.getByRole('button', { name: 'Edit target completion' }).click();
  await page.getByLabel('New Target Completion').fill('2027-02-04T13:30');
  await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'sla-validation.png') });
  await page.getByLabel('Justification').fill('Vendor rescheduled delivery');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'sla-updated.png') });

  await page.getByLabel('Partner Remarks').fill('Checked on site');
  await page.getByRole('button', { name: 'Add More' }).click();
  await page.locator('input[type="file"]').setInputFiles({ buffer: Buffer.from('fixture'), mimeType: 'application/pdf', name: 'qa-note.pdf' });
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'comment-populated.png') });

  await page.getByLabel('Type a log note… Use @ to mention someone').fill('@Alex please verify');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByRole('button', { name: 'Activity History' }).click();
  await page.getByRole('row').nth(1).click();
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'log-note-activity-expanded.png') });
  await context.close();
});
