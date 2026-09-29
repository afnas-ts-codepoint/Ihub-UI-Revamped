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

const evidenceRoot = resolve('docs/migration/qa/M8.6');

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
    host.id = 'm8-6-prototype-host';
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
    await expect(application.getByTestId('task-edit-action-bar')).toBeVisible();
    const directory = resolve(evidenceRoot, `${String(variant.width)}-${variant.theme}-${variant.locale}`);
    await mkdir(directory, { recursive: true });
    await application.screenshot({ fullPage: true, path: resolve(directory, 'default.png') });
    await captureSideBySide(prototype, application, comparison, resolve(directory, 'default-comparison.png'), variant.width, { fullPage: true });
    await context.close();
  });
}

test('interaction evidence: action bar dialogs, validation and mutation states', async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ viewport: { height: 1300, width: 1440 } });
  const page = await context.newPage();
  await prepareApplication(page, '/tasks/T-001/edit', 'paper', 'en');
  await mkdir(evidenceRoot, { recursive: true });
  await dismissApplicationReminder(page);

  const bar = page.getByTestId('task-edit-action-bar');
  await bar.getByRole('button', { name: 'CEO Comments' }).click();
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'ceo-comments-dialog.png') });
  await page.getByRole('button', { name: 'Cancel' }).click();

  await bar.getByRole('button', { name: 'Reject' }).click();
  await expect(page.getByRole('button', { name: 'Confirm Rejection' })).toBeDisabled();
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'reject-validation-disabled.png') });
  await page.getByLabel('Rejection Remarks (Max 500 Characters)').fill('Vendor missed the delivery window.');
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'reject-remarks-counter.png') });
  await page.getByRole('button', { name: 'Cancel' }).click();

  await bar.getByRole('button', { name: 'More' }).click();
  await page.getByRole('menuitem', { name: 'Redirect' }).click();
  const redirectDialog = page.getByRole('dialog', { name: 'Redirect Task' });
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'redirect-dialog.png') });
  await redirectDialog.getByLabel(/Process Owner/).selectOption('Safety Department');
  await redirectDialog.getByLabel(/^Assignee/).selectOption('Ahmed Ali');
  await redirectDialog.getByRole('button', { name: 'Redirect Task' }).click();
  await expect(page.getByText('Task redirected').first()).toBeVisible();
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'redirect-applied.png') });

  await page.getByRole('button', { name: 'Dependencies' }).click();
  await page.getByRole('button', { name: 'Add Dependency' }).click();
  const dependencyDialog = page.getByRole('dialog', { name: 'Add New Dependency' });
  await dependencyDialog.getByLabel(/^Category/).selectOption('Vendor');
  await dependencyDialog.getByLabel(/^Lead Time/).fill('5 business days');
  await dependencyDialog.getByLabel('Mark as Showstopper').check();
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'add-dependency-showstopper.png') });
  await dependencyDialog.getByRole('button', { name: 'Add Dependency' }).click();
  await expect(page.getByText('Dependency added').first()).toBeVisible();
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'dependency-added.png') });

  await page.getByRole('button', { name: 'Update Sub Tasks' }).click();
  const resolutionDialog = page.getByRole('dialog', { name: 'Resolution Tasks' });
  await resolutionDialog.getByRole('button', { name: 'Save & Update' }).click();
  await expect(page.getByRole('alert').first()).toContainText('Total weight exceeds 100%');
  await page.screenshot({ fullPage: true, path: resolve(evidenceRoot, 'update-subtasks-weight-blocked.png') });

  await context.close();
});
