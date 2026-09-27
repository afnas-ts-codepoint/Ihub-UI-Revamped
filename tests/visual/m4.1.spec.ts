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

const evidenceRoot = resolve('docs/migration/qa/M4.1');

type Master = Readonly<{
  appPath: string;
  prototypeRoute: string;
  slug: string;
}>;

const masters: readonly Master[] = [
  {
    appPath: '/masters/admin/project-category-master',
    prototypeRoute: 'masters/admin/project-category-master',
    slug: 'project-category-master',
  },
  {
    appPath: '/masters/general/machine-master',
    prototypeRoute: 'masters/general/machine-master',
    slug: 'machine-master',
  },
  {
    appPath: '/masters/operation/assignment-areas',
    prototypeRoute: 'masters/operation/assignment-areas',
    slug: 'assignment-areas',
  },
  {
    appPath: '/masters/operation/task-mapping',
    prototypeRoute: 'masters/operation/task-mapping',
    slug: 'task-mapping',
  },
  {
    appPath: '/masters/operation/sub-area',
    prototypeRoute: 'masters/operation/sub-area',
    slug: 'sub-area',
  },
];

async function openPair(
  prototype: Page,
  application: Page,
  master: Master,
  theme: QaTheme,
  locale: QaLocale,
) {
  await preparePrototype(prototype, master.prototypeRoute, theme, locale);
  await prepareApplication(application, master.appPath, theme, locale);
  await Promise.all([
    prototype.locator('table').first().waitFor(),
    application.locator('table').first().waitFor(),
  ]);
}

async function capture(
  prototype: Page,
  application: Page,
  comparison: Page,
  directory: string,
  name: string,
  width: number,
) {
  await mkdir(directory, { recursive: true });
  await captureSideBySide(
    prototype,
    application,
    comparison,
    resolve(directory, `${name}.png`),
    width,
  );
}

// One state per master rotates through the five interactions the phase
// requires evidence for; every one of the five Masters gets direct fidelity
// evidence, and every state gets exercised at least once.
const perMasterState: readonly ((
  prototype: Page,
  application: Page,
) => Promise<void>)[] = [
  // Project Category Master — Active status chip engaged.
  async (prototype, application) => {
    await Promise.all([
      prototype.locator('button', { hasText: 'Active' }).first().click(),
      application.locator('button', { hasText: 'Active' }).first().click(),
    ]);
  },
  // Machine Master — search applied.
  async (prototype, application) => {
    await Promise.all([
      prototype.getByPlaceholder('Search records..').fill('Sample'),
      application.getByPlaceholder('Search records..').fill('Sample'),
    ]);
  },
  // Assignment Areas — filter dialog open.
  async (prototype, application) => {
    await Promise.all([
      prototype.getByRole('button', { name: 'Filters' }).click(),
      application.getByRole('button', { name: 'Filters' }).click(),
    ]);
    await Promise.all([
      prototype.getByText('Filter records').waitFor(),
      application.getByText('Filter records').waitFor(),
    ]);
  },
  // Task Mapping — settings dialog open.
  async (prototype, application) => {
    await Promise.all([
      prototype.getByRole('button', { exact: true, name: 'Settings' }).click(),
      application
        .getByRole('button', { exact: true, name: 'Settings' })
        .click(),
    ]);
    await Promise.all([
      prototype.getByText('Chip Settings').waitFor(),
      application.getByText('Chip Settings').waitFor(),
    ]);
  },
  // Sub Area — delete confirmation open.
  async (prototype, application) => {
    await Promise.all([
      prototype.getByRole('button', { name: 'Delete' }).first().click(),
      application.getByRole('button', { name: 'Delete' }).first().click(),
    ]);
    await Promise.all([
      prototype.getByText('Delete Record').waitFor(),
      application.getByText('Delete Record').waitFor(),
    ]);
  },
];

test.describe('M4.1 Master listing — reduced matrix', () => {
  masters.forEach((master, index) => {
    test(`${master.slug} — default listing (desktop, paper, en)`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { height: 900, width: 1440 },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await openPair(prototype, application, master, 'paper', 'en');

      await capture(
        prototype,
        application,
        comparison,
        resolve(evidenceRoot, master.slug),
        '1440-paper-en-default',
        1440,
      );
      await context.close();
    });

    test(`${master.slug} — representative interactive state`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { height: 900, width: 1440 },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await openPair(prototype, application, master, 'paper', 'en');
      await perMasterState[index]?.(prototype, application);

      await capture(
        prototype,
        application,
        comparison,
        resolve(evidenceRoot, master.slug),
        '1440-paper-en-state',
        1440,
      );
      await context.close();
    });
  });

  const representative = masters.find(
    (master) => master.slug === 'project-category-master',
  );
  if (!representative) throw new Error('representative master not found');
  const sweep: readonly Readonly<{
    locale: QaLocale;
    name: string;
    theme: QaTheme;
    width: number;
  }>[] = [
    { locale: 'en', name: '1440-ink-en', theme: 'ink', width: 1440 },
    { locale: 'ar', name: '1440-paper-ar-rtl', theme: 'paper', width: 1440 },
    { locale: 'en', name: '390-paper-en-mobile', theme: 'paper', width: 390 },
  ];

  for (const { locale, name, theme, width } of sweep) {
    test(`${representative.slug} — ${name}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { height: 900, width },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await openPair(prototype, application, representative, theme, locale);

      await capture(
        prototype,
        application,
        comparison,
        resolve(evidenceRoot, representative.slug),
        name,
        width,
      );
      await context.close();
    });
  }

  test('Masters (List) variant — representative listing', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { height: 900, width: 1440 },
    });
    const prototype = await context.newPage();
    const application = await context.newPage();
    const comparison = await context.newPage();

    await preparePrototype(
      prototype,
      'masters-list/admin/project-category-master',
      'paper',
      'en',
    );
    await prepareApplication(
      application,
      '/masters-list/admin/project-category-master',
      'paper',
      'en',
    );
    await Promise.all([
      prototype.locator('table').first().waitFor(),
      application.locator('table').first().waitFor(),
    ]);

    await capture(
      prototype,
      application,
      comparison,
      resolve(evidenceRoot, 'masters-list'),
      '1440-paper-en',
      1440,
    );
    await context.close();
  });

  test('MasterPendingPage — representative screenless item', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { height: 900, width: 1440 },
    });
    const prototype = await context.newPage();
    const application = await context.newPage();
    const comparison = await context.newPage();

    await preparePrototype(prototype, 'masters/admin/brand', 'paper', 'en');
    await prepareApplication(
      application,
      '/masters/admin/brand',
      'paper',
      'en',
    );
    await Promise.all([
      prototype.getByText('Page not available yet').waitFor(),
      application.getByText('Page not available yet').waitFor(),
    ]);

    await capture(
      prototype,
      application,
      comparison,
      resolve(evidenceRoot, 'pending'),
      '1440-paper-en',
      1440,
    );
    await context.close();
  });
});
