import { Buffer } from 'node:buffer';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { test, type Page } from '@playwright/test';
import { utils, write } from 'xlsx';

import { captureSideBySide, prepareApplication, preparePrototype, type QaLocale, type QaTheme } from './helpers';

const evidenceRoot = resolve('docs/migration/qa/M4.3');
const projectCategory = { app: '/masters/admin/project-category-master', route: 'masters/admin/project-category-master', title: 'Project Category Master' } as const;
const subArea = { app: '/masters/operation/sub-area', route: 'masters/operation/sub-area', title: 'Sub Area' } as const;

type Master = typeof projectCategory | typeof subArea;
type UploadFormat = 'csv' | 'xls' | 'xlsx';

function uploadFile(format: UploadFormat, empty = false) {
  if (format === 'csv') {
    return {
      buffer: Buffer.from(empty ? 'Name\r\n' : 'Name,Ignored\r\n Alpha ,Extra\r\nAlpha\r\n Beta '),
      mimeType: 'text/csv',
      name: empty ? 'empty.csv' : 'visual-names.csv',
    };
  }

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([
    ['Name', 'Ignored'],
    [' Alpha ', 'Extra'],
    ['Alpha'],
    [' Beta '],
  ]), 'Names');
  const bytes = write(workbook, { bookType: format, type: 'array' }) as ArrayBuffer;
  return {
    buffer: Buffer.from(new Uint8Array(bytes)),
    mimeType: format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/vnd.ms-excel',
    name: `visual-names.${format}`,
  };
}

async function openPair(prototype: Page, application: Page, master: Master, theme: QaTheme, locale: QaLocale) {
  await Promise.all([
    preparePrototype(prototype, master.route, theme, locale),
    prepareApplication(application, master.app, theme, locale),
  ]);
  await Promise.all([prototype.locator('table').first().waitFor(), application.locator('table').first().waitFor()]);
  const name = new RegExp(`${master.title}$`);
  await Promise.all([
    prototype.getByRole('button', { name }).click(),
    application.getByRole('button', { name }).click(),
  ]);
  await Promise.all([prototype.getByRole('dialog').waitFor(), application.getByTestId('master-add-dialog').waitFor()]);
}

async function uploadPair(prototype: Page, application: Page, format: UploadFormat, empty = false) {
  const file = uploadFile(format, empty);
  await Promise.all([
    prototype.locator('input[type="file"]').setInputFiles(file),
    application.locator('input[type="file"]').setInputFiles(file),
  ]);
  await Promise.all([
    prototype.locator('[role="dialog"] .chip.ok').waitFor(),
    application.getByTestId('bulk-import-note').waitFor(),
  ]);
}

async function capture(prototype: Page, application: Page, comparison: Page, name: string, width: number) {
  await mkdir(evidenceRoot, { recursive: true });
  await captureSideBySide(prototype, application, comparison, resolve(evidenceRoot, `${name}.png`), width);
}

const states = [
  { format: null, locale: 'en', master: projectCategory, name: 'project-category-default-1440-paper-en', theme: 'paper', width: 1440 },
  { format: 'csv', locale: 'en', master: projectCategory, name: 'project-category-csv-1440-paper-en', theme: 'paper', width: 1440 },
  { format: 'xlsx', locale: 'en', master: projectCategory, name: 'project-category-xlsx-1440-ink-en', theme: 'ink', width: 1440 },
  { format: 'csv', locale: 'ar', master: projectCategory, name: 'project-category-csv-1440-paper-ar-rtl', theme: 'paper', width: 1440 },
  { empty: true, format: 'csv', locale: 'en', master: projectCategory, name: 'project-category-empty-390-paper-en', theme: 'paper', width: 390 },
  { format: null, locale: 'en', master: subArea, name: 'sub-area-default-1440-paper-en', theme: 'paper', width: 1440 },
  { format: 'xls', locale: 'en', master: subArea, name: 'sub-area-xls-1440-paper-en', theme: 'paper', width: 1440 },
  { format: 'xlsx', locale: 'ar', master: subArea, name: 'sub-area-xlsx-1440-ink-ar-rtl', theme: 'ink', width: 1440 },
  { format: 'csv', locale: 'en', master: subArea, name: 'sub-area-csv-390-paper-en', theme: 'paper', width: 390 },
] as const;

test.describe('M4.3 bulk import evidence', () => {
  for (const state of states) {
    test(state.name, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { height: 1000, width: state.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await openPair(prototype, application, state.master, state.theme, state.locale);
      if (state.format) await uploadPair(prototype, application, state.format, 'empty' in state && state.empty);
      await capture(prototype, application, comparison, state.name, state.width);
      await context.close();
    });
  }
});
