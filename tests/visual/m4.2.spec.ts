import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { test, type Page } from '@playwright/test';

import { captureSideBySide, prepareApplication, preparePrototype, type QaLocale, type QaTheme } from './helpers';

const evidenceRoot = resolve('docs/migration/qa/M4.2');
const masters = [
  { app: '/masters/admin/project-category-master', name: 'project-category-add', route: 'masters/admin/project-category-master', title: 'Project Category Master' },
  { app: '/masters/general/machine-master', name: 'machine-add', route: 'masters/general/machine-master', title: 'Machine Master' },
  { app: '/masters/operation/assignment-areas', name: 'assignment-areas-add', route: 'masters/operation/assignment-areas', title: 'Assignment Areas' },
  { app: '/masters/operation/task-mapping', name: 'task-mapping-add', route: 'masters/operation/task-mapping', title: 'Task Mapping' },
  { app: '/masters/operation/sub-area', name: 'sub-area-add', route: 'masters/operation/sub-area', title: 'Sub Area' },
] as const;

async function openPair(prototype: Page, application: Page, item: typeof masters[number], theme: QaTheme, locale: QaLocale) {
  await Promise.all([
    preparePrototype(prototype, item.route, theme, locale),
    prepareApplication(application, item.app, theme, locale),
  ]);
  await Promise.all([prototype.locator('table').first().waitFor(), application.locator('table').first().waitFor()]);
}

async function openAdd(prototype: Page, application: Page, title: string) {
  const name = new RegExp(`${title}$`);
  await Promise.all([
    prototype.getByRole('button', { name }).click(),
    application.getByRole('button', { name }).click(),
  ]);
  await Promise.all([prototype.getByRole('dialog').waitFor(), application.getByTestId('master-add-dialog').waitFor()]);
}

async function capture(prototype: Page, application: Page, comparison: Page, name: string, width: number) {
  await mkdir(evidenceRoot, { recursive: true });
  await captureSideBySide(prototype, application, comparison, resolve(evidenceRoot, `${name}.png`), width);
}

test.describe('M4.2 Master forms evidence', () => {
  for (const item of masters) {
    test(`${item.name} default`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { height: 1000, width: 1440 } });
      const prototype = await context.newPage(); const application = await context.newPage(); const comparison = await context.newPage();
      await openPair(prototype, application, item, 'paper', 'en');
      await openAdd(prototype, application, item.title);
      await capture(prototype, application, comparison, `${item.name}-1440-paper-en`, 1440);
      await context.close();
    });
  }

  test('view and edit dialogs', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { height: 1000, width: 1440 } });
    const prototype = await context.newPage(); const application = await context.newPage(); const comparison = await context.newPage();
    await openPair(prototype, application, masters[0], 'paper', 'en');
    await Promise.all([prototype.getByRole('button', { name: 'View' }).first().click(), application.getByRole('button', { name: 'View' }).first().click()]);
    await capture(prototype, application, comparison, 'view-project-category-1440-paper-en', 1440);
    await Promise.all([prototype.getByRole('button', { name: 'Edit' }).last().click(), application.getByRole('button', { name: 'Edit' }).last().click()]);
    await capture(prototype, application, comparison, 'edit-project-category-1440-paper-en', 1440);
    await context.close();
  });

  test('valid populated add still displays without persistence until submit', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { height: 1000, width: 1440 } });
    const prototype = await context.newPage(); const application = await context.newPage(); const comparison = await context.newPage();
    await openPair(prototype, application, masters[0], 'paper', 'en');
    await openAdd(prototype, application, masters[0].title);
    await Promise.all([prototype.getByPlaceholder('Enter name').fill('Visual QA category'), application.getByRole('textbox', { name: 'Name' }).fill('Visual QA category')]);
    await capture(prototype, application, comparison, 'project-category-add-valid-1440-paper-en', 1440);
    await context.close();
  });

  for (const state of [
    { locale: 'en' as const, name: 'task-mapping-add-1440-ink-en', theme: 'ink' as const, width: 1440 },
    { locale: 'ar' as const, name: 'task-mapping-add-1440-paper-ar', theme: 'paper' as const, width: 1440 },
    { locale: 'en' as const, name: 'sub-area-add-390-paper-en', theme: 'paper' as const, width: 390 },
  ]) {
    test(state.name, async ({ browser }) => {
      const item = state.width === 390 ? masters[4] : masters[3];
      const context = await browser.newContext({ viewport: { height: 900, width: state.width } });
      const prototype = await context.newPage(); const application = await context.newPage(); const comparison = await context.newPage();
      await openPair(prototype, application, item, state.theme, state.locale);
      await openAdd(prototype, application, item.title);
      await capture(prototype, application, comparison, state.name, state.width);
      await context.close();
    });
  }
});
