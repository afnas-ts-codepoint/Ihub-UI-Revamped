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

const labels = {
  en: {
    mapping: 'Work-area mapping',
    report: 'Report',
    add: 'Add touch point',
    prototypeAdd: 'Add touch point',
    addTitle: 'Add a touch point',
    editTitle: 'Edit touch point',
    save: 'Save changes',
    low: 'Low',
    medium: 'Medium',
  },
  ar: {
    mapping: 'مناطق العمل',
    report: 'تقرير',
    add: 'إضافة نقطة',
    prototypeAdd: 'إضافة',
    addTitle: 'إضافة نقطة',
    editTitle: 'تعديل نقطة',
    save: 'حفظ التغييرات',
    low: 'منخفض',
    medium: 'متوسط',
  },
} as const;

async function openMapping(page: Page, locale: QaLocale) {
  await page.getByText(labels[locale].mapping, { exact: true }).click();
  await page.getByText('Fire Alarm Systems', { exact: true }).waitFor();
}
async function openDepartment(page: Page) {
  await page.getByText('Facility maintenance', { exact: true }).first().click();
  await page
    .getByText('Blocked drain — Zone C restrooms', { exact: true })
    .waitFor();
}
async function openAdd(page: Page, locale: QaLocale) {
  await page
    .getByRole('button', { name: new RegExp(labels[locale].add) })
    .first()
    .click();
  await page
    .getByRole('heading', { name: labels[locale].addTitle, exact: true })
    .waitFor();
}

function workAreaDialog(page: Page, locale: QaLocale, prototype: boolean) {
  return prototype
    ? page
        .getByRole('heading', {
          name: labels[locale].addTitle,
          exact: true,
        })
        .locator('xpath=ancestor::div[contains(@class,"card")][1]')
    : page.getByRole('dialog', {
        name: labels[locale].addTitle,
        exact: true,
      });
}

type State =
  | 'add'
  | 'department'
  | 'edit'
  | 'empty-priority'
  | 'invalid'
  | 'item'
  | 'mapping'
  | 'overview'
  | 'priority'
  | 'report'
  | 'search';
const states: readonly State[] = [
  'overview',
  'department',
  'item',
  'mapping',
  'search',
  'priority',
  'add',
  'edit',
  'invalid',
  'empty-priority',
  'report',
];
const variants: readonly Readonly<{
  locale: QaLocale;
  theme: QaTheme;
  width: number;
}>[] = [
  { width: 1440, theme: 'paper', locale: 'en' },
  { width: 1440, theme: 'ink', locale: 'en' },
  { width: 1440, theme: 'paper', locale: 'ar' },
  { width: 760, theme: 'paper', locale: 'en' },
  { width: 390, theme: 'paper', locale: 'en' },
];

async function applyState(
  page: Page,
  state: State,
  locale: QaLocale,
  prototype: boolean,
) {
  if (state === 'report') {
    await page
      .getByText(labels[locale].report, { exact: true })
      .first()
      .click();
    await page.locator('h2').first().waitFor();
    return;
  }
  if (state === 'department' || state === 'item') {
    await openDepartment(page);
    if (state === 'item') {
      await page
        .getByText('Blocked drain — Zone C restrooms', { exact: true })
        .click();
      await page
        .getByText(
          locale === 'ar'
            ? 'معاينة للقراءة فقط لهذا السجل.'
            : 'Read-only preview of this record.',
          { exact: true },
        )
        .waitFor();
    }
    return;
  }
  if (state === 'overview') {
    await page.getByText('Quality assurance', { exact: true }).waitFor();
    return;
  }
  await openMapping(page, locale);
  if (state === 'mapping') return;
  if (state === 'search') {
    const search = page.locator('main input, section input').first();
    await search.fill('shattered');
    await page.getByText('Glass & Acrylic', { exact: true }).waitFor();
    return;
  }
  if (state === 'priority') {
    const low = prototype ? 'Low' : labels[locale].low;
    await page.getByRole('button', { name: low, exact: true }).first().click();
    await page
      .getByText('Painting & Decorative Carpentry', { exact: true })
      .waitFor();
    return;
  }
  if (state === 'edit') {
    await page.getByText('Fire Alarm Systems', { exact: true }).click();
    await page
      .getByRole('heading', { name: labels[locale].editTitle, exact: true })
      .waitFor();
    return;
  }
  await openAdd(page, locale);
  if (state === 'add') return;
  const dialog = workAreaDialog(page, locale, prototype);
  const addAction = prototype
    ? labels[locale].prototypeAdd
    : labels[locale].add;
  if (state === 'invalid') {
    await dialog.getByRole('button', { name: addAction, exact: true }).click();
    await dialog.waitFor();
    return;
  }
  const area = dialog.locator('input').first();
  await area.fill('QA touch point');
  const medium = prototype ? 'Medium' : labels[locale].medium;
  await dialog.getByRole('button', { name: medium, exact: true }).click();
  await dialog.getByRole('button', { name: addAction, exact: true }).click();
  await page.getByText('QA touch point', { exact: true }).waitFor();
}

async function normalizedRows(page: Page, tableIndex: number) {
  return page
    .locator('table')
    .nth(tableIndex)
    .locator('tr')
    .evaluateAll((rows) =>
      rows.map((row) =>
        [...row.querySelectorAll('th,td')].map((cell) =>
          cell.textContent.replace(/\s+/g, ' ').trim(),
        ),
      ),
    );
}

test('rendered Overview and Work-area rows match the prototype', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { height: 900, width: 1440 },
  });
  const prototype = await context.newPage();
  const application = await context.newPage();
  await Promise.all([
    preparePrototype(prototype, 'sla', 'paper', 'en'),
    prepareApplication(application, '/quality/sla', 'paper', 'en'),
  ]);
  await Promise.all([
    prototype.locator('table').first().waitFor(),
    application.locator('table').first().waitFor(),
  ]);
  expect(await normalizedRows(application, 0)).toEqual(
    await normalizedRows(prototype, 0),
  );
  await expect(
    prototype.getByText('The SLA clock', { exact: true }),
  ).toHaveCount(0);
  await expect(
    application.getByText('The SLA clock', { exact: true }),
  ).toHaveCount(0);
  await Promise.all([
    openMapping(prototype, 'en'),
    openMapping(application, 'en'),
  ]);
  expect(await normalizedRows(application, 0)).toEqual(
    await normalizedRows(prototype, 0),
  );
  await context.close();
});

const evidenceRoot = resolve('docs/migration/qa/M3.8');
for (const state of states) {
  for (const { locale, theme, width } of variants) {
    test(`capture ${state} ${String(width)} ${theme} ${locale}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { height: 900, width },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await Promise.all([
        preparePrototype(prototype, 'sla', theme, locale),
        prepareApplication(application, '/quality/sla', theme, locale),
      ]);
      await applyState(prototype, state, locale, true);
      await applyState(application, state, locale, false);
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
