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

type State =
  | 'checklists-create'
  | 'checklists-edit-filled'
  | 'create-task'
  | 'price-change'
  | 'price-change-closed'
  | 'promotions'
  | 'tasks';

const labels = {
  checklists: { ar: 'قوائم المراجعة', en: 'Checklists' },
  closed: { ar: 'Closed', en: 'Closed' },
  commercial: { ar: 'تجاري', en: 'Commercial' },
  createTask: { ar: 'إنشاء مهمة جديدة', en: 'Create a New Task' },
  editFilled: { ar: 'تعديل قائمة معبأة', en: 'Edit Filled Checklist' },
  priceChange: { ar: 'تغيير السعر', en: 'Price Change' },
  promotions: { ar: 'العروض', en: 'Promotions' },
  tasks: { ar: 'أوامر العمل', en: 'Tasks' },
  workCentre: { ar: 'مركز العمل', en: 'Work Centre' },
} as const;

const appPaths: Record<State, string> = {
  'checklists-create': '/home/work-centre/checklists/create',
  'checklists-edit-filled': '/home/work-centre/checklists/edit-filled',
  'create-task': '/home/work-centre/create-task',
  'price-change': '/home/work-centre/price-change',
  'price-change-closed': '/home/work-centre/price-change',
  promotions: '/home/work-centre/promotions',
  tasks: '/home/work-centre/tasks',
};

async function clickMainButton(page: Page, name: string) {
  await page.getByRole('main').getByRole('button', { exact: true, name }).first().click();
}

async function openPrototype(
  page: Page,
  locale: QaLocale,
  theme: QaTheme,
  state: State,
) {
  await preparePrototype(page, 'dashboard', theme, locale);
  await clickMainButton(page, labels.workCentre[locale]);

  if (state === 'create-task') return;
  if (state === 'tasks') {
    await clickMainButton(page, labels.tasks[locale]);
    return;
  }
  if (state.startsWith('checklists')) {
    await clickMainButton(page, labels.checklists[locale]);
    if (state === 'checklists-edit-filled') {
      await clickMainButton(page, labels.editFilled[locale]);
    }
    return;
  }

  await clickMainButton(page, labels.commercial[locale]);
  if (state === 'promotions') {
    await clickMainButton(page, labels.promotions[locale]);
  }
  if (state === 'price-change-closed') {
    await page
      .getByRole('main')
      .getByRole('button', { name: new RegExp(`^${labels.closed[locale]}\\s+47$`) })
      .click();
  }
}

async function openApplication(
  page: Page,
  locale: QaLocale,
  theme: QaTheme,
  state: State,
) {
  await prepareApplication(page, appPaths[state], theme, locale);
  if (state === 'price-change-closed') {
    await page.getByRole('main').getByRole('tab', { name: 'Closed 47' }).click();
  }
}

const states: readonly State[] = [
  'create-task',
  'tasks',
  'checklists-create',
  'checklists-edit-filled',
  'price-change',
  'price-change-closed',
  'promotions',
];

const evidenceRoot = resolve('docs/migration/qa/M7.1');

for (const state of states) {
  for (const variant of variants) {
    test(`${state} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({
      browser,
    }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({
        viewport: { height: 1100, width: variant.width },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await Promise.all([
        openPrototype(prototype, variant.locale, variant.theme, state),
        openApplication(application, variant.locale, variant.theme, state),
      ]);

      if (state === 'create-task' || state === 'tasks' || state.startsWith('checklists')) {
        await expect(application.getByRole('link', { name: labels.createTask[variant.locale] })).toBeVisible();
        await expect(application.getByRole('link', { name: labels.tasks[variant.locale] })).toBeVisible();
      } else {
        await expect(application.getByRole('link', { name: labels.priceChange[variant.locale] })).toBeVisible();
        await expect(application.getByRole('link', { name: labels.promotions[variant.locale] })).toBeVisible();
      }
      if (state === 'create-task' || state === 'tasks') {
        await expect(application.locator('[data-migration-pending]')).toBeVisible();
      }
      if (state === 'price-change' || state === 'price-change-closed' || state === 'promotions') {
        await expect(application.getByTestId('work-centre-fallback')).toBeVisible();
      }

      await prototype.waitForTimeout(300);
      await application.waitForTimeout(300);
      const directory = resolve(evidenceRoot, state);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(
        prototype,
        application,
        comparison,
        resolve(
          directory,
          `${String(variant.width)}-${variant.theme}-${variant.locale}.png`,
        ),
        variant.width,
        { fullPage: state !== 'create-task' && state !== 'tasks' },
      );
      await context.close();
    });
  }
}
