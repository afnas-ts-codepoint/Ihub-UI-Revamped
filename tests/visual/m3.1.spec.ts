import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { test, type Page } from '@playwright/test';

import {
  captureSideBySide,
  prepareApplication,
  preparePrototype,
  type QaLocale,
  type QaTheme,
} from './helpers';

const labels = {
  apply: { en: 'Apply filters', ar: 'تطبيق' },
  excel: { en: 'Excel spreadsheet', ar: 'جدول إكسل' },
  export: { en: 'Export', ar: 'تصدير' },
  filters: { en: 'Filters', ar: 'المرشّحات' },
  flag: { en: 'Showstoppers only', ar: 'المعوقات فقط' },
  from: { en: 'From', ar: 'من' },
  report: { en: 'Report', ar: 'تقرير' },
  to: { en: 'To', ar: 'إلى' },
} as const;

type ReportState = Readonly<{
  applicationPath?: string;
  name: string;
  openReport?: boolean;
  prototypeRoute?: string;
  setup?: (
    prototype: Page,
    application: Page,
    locale: QaLocale,
  ) => Promise<void>;
}>;

async function openReport(page: Page, locale: QaLocale) {
  await page
    .getByRole('button', { name: labels.report[locale], exact: true })
    .first()
    .click();
  await page.locator('h2').first().waitFor();
}

async function openFilter(page: Page, locale: QaLocale) {
  await page
    .getByRole('button', { name: labels.filters[locale], exact: true })
    .click();
  await page.getByRole('dialog').waitFor();
}

async function openFromCalendar(
  page: Page,
  locale: QaLocale,
  prototype: boolean,
) {
  const dialog = page.getByRole('dialog');
  if (prototype) {
    await dialog
      .locator('label')
      .filter({ hasText: labels.from[locale] })
      .last()
      .getByRole('button')
      .click();
  } else {
    await dialog
      .getByRole('button', { name: labels.from[locale], exact: true })
      .click();
  }
  await page.waitForTimeout(100);
}

async function openProcessOwnerSelect(prototype: Page, application: Page) {
  await Promise.all([
    prototype.getByRole('dialog').locator('input[type="text"]').nth(1).click(),
    application.getByRole('dialog').getByRole('combobox').first().click(),
  ]);
}

async function setDateRangeConstraint(
  prototype: Page,
  application: Page,
  locale: QaLocale,
) {
  await Promise.all([
    openFromCalendar(prototype, locale, true),
    openFromCalendar(application, locale, false),
  ]);
  await Promise.all([
    prototype.getByRole('button', { name: '20', exact: true }).click(),
    application.getByRole('button', { name: '2026-09-20' }).click(),
  ]);

  const prototypeDialog = prototype.getByRole('dialog');
  await Promise.all([
    prototypeDialog
      .locator('label')
      .filter({ hasText: labels.to[locale] })
      .last()
      .getByRole('button')
      .click(),
    application
      .getByRole('dialog')
      .getByRole('button', { name: labels.to[locale], exact: true })
      .click(),
  ]);
}

const states: readonly ReportState[] = [
  {
    applicationPath: '/hr/dashboard',
    name: 'section-default',
    openReport: false,
    prototypeRoute: 'overtime/dashboard',
  },
  { name: 'report-default' },
  {
    name: 'record-filter-dialog',
    setup: async (prototype, application, locale) => {
      await Promise.all([
        openFilter(prototype, locale),
        openFilter(application, locale),
      ]);
    },
  },
  {
    name: 'select-open',
    setup: async (prototype, application, locale) => {
      await Promise.all([
        openFilter(prototype, locale),
        openFilter(application, locale),
      ]);
      await openProcessOwnerSelect(prototype, application);
    },
  },
  {
    name: 'select-no-results',
    setup: async (prototype, application, locale) => {
      await Promise.all([
        openFilter(prototype, locale),
        openFilter(application, locale),
      ]);
      await openProcessOwnerSelect(prototype, application);
      await Promise.all([
        prototype
          .getByRole('dialog')
          .locator('input[type="text"]')
          .nth(1)
          .fill('zz-no-match'),
        application
          .getByRole('dialog')
          .getByRole('combobox')
          .first()
          .fill('zz-no-match'),
      ]);
    },
  },
  {
    name: 'record-filter-calendar',
    setup: async (prototype, application, locale) => {
      await Promise.all([
        openFilter(prototype, locale),
        openFilter(application, locale),
      ]);
      await Promise.all([
        openFromCalendar(prototype, locale, true),
        openFromCalendar(application, locale, false),
      ]);
    },
  },
  {
    name: 'date-range-constraints',
    setup: async (prototype, application, locale) => {
      await Promise.all([
        openFilter(prototype, locale),
        openFilter(application, locale),
      ]);
      await setDateRangeConstraint(prototype, application, locale);
    },
  },
  {
    name: 'record-filter-applied',
    setup: async (prototype, application, locale) => {
      await Promise.all([
        openFilter(prototype, locale),
        openFilter(application, locale),
      ]);
      await Promise.all([
        prototype
          .getByRole('button', { name: labels.flag[locale], exact: true })
          .click(),
        application
          .getByRole('button', { name: labels.flag[locale], exact: true })
          .click(),
      ]);
      await Promise.all([
        prototype
          .getByRole('button', { name: labels.apply[locale], exact: true })
          .click(),
        application
          .getByRole('button', { name: labels.apply[locale], exact: true })
          .click(),
      ]);
    },
  },
  {
    name: 'export-menu',
    setup: async (prototype, application, locale) => {
      await Promise.all([
        prototype
          .getByRole('button', { name: labels.export[locale], exact: true })
          .click(),
        application
          .getByRole('button', { name: labels.export[locale], exact: true })
          .click(),
      ]);
      await Promise.all([
        prototype.getByText(labels.excel[locale], { exact: true }).waitFor(),
        application.getByText(labels.excel[locale], { exact: true }).waitFor(),
      ]);
    },
  },
  {
    applicationPath: '/settings/work-centre',
    name: 'wrapped-placeholder',
    openReport: false,
    prototypeRoute: 'settings-configuration/work-centre',
  },
];

const widths = [1440, 1040, 760, 390] as const;
const themes: readonly QaTheme[] = ['paper', 'ink'];
const locales: readonly QaLocale[] = ['en', 'ar'];
const evidenceRoot = resolve('docs/migration/qa/M3.1');

for (const state of states) {
  for (const width of widths) {
    for (const theme of themes) {
      for (const locale of locales) {
        test(`${state.name} ${String(width)} ${theme} ${locale}`, async ({
          browser,
        }) => {
          const context = await browser.newContext({
            viewport: { height: 900, width },
          });
          const prototype = await context.newPage();
          const application = await context.newPage();
          const comparison = await context.newPage();

          await preparePrototype(
            prototype,
            state.prototypeRoute ?? 'overtime',
            theme,
            locale,
          );
          await prepareApplication(
            application,
            state.applicationPath ?? '/hr',
            theme,
            locale,
          );
          if (state.openReport !== false) {
            await Promise.all([
              openReport(prototype, locale),
              openReport(application, locale),
            ]);
          }
          await state.setup?.(prototype, application, locale);

          const directory = resolve(evidenceRoot, state.name);
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
  }
}
