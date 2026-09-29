import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

import {
  captureSideBySide,
  prepareApplication,
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

const evidenceRoot = resolve('docs/migration/qa/M8.1');

async function prepareCurrentPrototype(page: import('@playwright/test').Page) {
  await page.goto('http://127.0.0.1:4174', {
    waitUntil: 'domcontentloaded',
  });
  await page.locator('body').waitFor();
  await page.getByRole('button', { name: 'Work Centre', exact: true }).click();
  await page.getByRole('button', { name: 'Tasks', exact: true }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();
}

for (const variant of variants) {
  test(`M8.1 visual evidence ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({
    browser,
  }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({
      viewport: { height: 1100, width: variant.width },
    });
    const application = await context.newPage();
    const prototype = await context.newPage();
    const comparison = await context.newPage();

    await prepareApplication(
      application,
      '/home/work-centre/tasks',
      variant.theme,
      variant.locale,
    );
    await prepareCurrentPrototype(prototype);

    await expect(application).toHaveURL(/\/home\/work-centre\/tasks$/);
    await expect(application.getByTestId('tasks-page')).toBeVisible();
    await expect(application.locator('tbody tr')).toHaveCount(6);

    const directory = resolve(
      evidenceRoot,
      `${String(variant.width)}-${variant.theme}-${variant.locale}`,
    );
    await mkdir(directory, { recursive: true });

    await application.screenshot({
      path: resolve(directory, 'list.png'),
      fullPage: true,
    });
    await captureSideBySide(
      prototype,
      application,
      comparison,
      resolve(directory, 'list-comparison.png'),
      variant.width,
      { fullPage: true },
    );

    await application
      .locator('[data-testid="tasks-page"] button')
      .nth(2)
      .click();
    await expect(application.getByTestId('task-board')).toBeVisible();
    await application.screenshot({
      path: resolve(directory, 'board.png'),
      fullPage: true,
    });

    await application
      .locator('[data-board-column="completed"] button')
      .first()
      .click();
    await expect(application.getByRole('dialog')).toBeVisible();
    await application.screenshot({
      path: resolve(directory, 'detail-modal.png'),
      fullPage: true,
    });
    await application.keyboard.press('Escape');
    await expect(application.getByRole('dialog')).toHaveCount(0);

    await application
      .locator('[data-testid="tasks-page"] button')
      .first()
      .click();
    await expect(
      application.getByTestId('task-dashboard-pending'),
    ).toBeVisible();
    await application.screenshot({
      path: resolve(directory, 'dashboard-pending.png'),
      fullPage: true,
    });

    await application
      .locator('[data-testid="tasks-page"] button')
      .nth(1)
      .click();
    await application.locator('button:has(svg.lucide-filter)').first().click();
    await expect(application.getByRole('dialog')).toBeVisible();
    await application.screenshot({
      path: resolve(directory, 'filter-dialog.png'),
      fullPage: true,
    });

    await context.close();
  });
}
