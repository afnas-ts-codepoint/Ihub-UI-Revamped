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

type State =
  | 'default'
  | 'filter'
  | 'finance'
  | 'operations'
  | 'performance'
  | 'quality'
  | 'revenue'
  | 'search'
  | 'system'
  | 'workforce';

const states: readonly State[] = [
  'default',
  'workforce',
  'performance',
  'finance',
  'operations',
  'quality',
  'system',
  'revenue',
  'filter',
  'search',
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

const groupForState: Partial<Record<State, string>> = {
  workforce: 'Workforce',
  performance: 'Performance',
  finance: 'Finance',
  operations: 'Operations',
  quality: 'Quality',
  system: 'System',
  revenue: 'Finance',
};

async function applyState(page: Page, state: State) {
  const main = page.locator('main');
  const group = groupForState[state];
  if (group) {
    await main.getByRole('button', { name: group, exact: true }).click();
  }
  if (state === 'revenue') {
    await main
      .getByRole('button', { name: 'Revenue Projection', exact: true })
      .click();
  }
  if (state === 'search') {
    await main.getByRole('button', { name: 'Search', exact: true }).click();
  }
  if (state === 'filter') {
    await main
      .getByText('Department', { exact: true })
      .scrollIntoViewIfNeeded();
  }
  if (state === 'search' || state === 'revenue') {
    await main
      .getByText(
        'Run search to generate report. Result table will render here.',
        { exact: true },
      )
      .scrollIntoViewIfNeeded();
  }
}

test('standalone catalogue and inert Search match the approved prototype behavior', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { height: 900, width: 1440 },
  });
  const prototype = await context.newPage();
  const application = await context.newPage();
  await Promise.all([
    preparePrototype(prototype, 'reports', 'paper', 'en'),
    prepareApplication(application, '/reports', 'paper', 'en'),
  ]);

  for (const group of [
    'HR',
    'Workforce',
    'Performance',
    'Finance',
    'Operations',
    'Quality',
    'System',
  ]) {
    await Promise.all([
      prototype
        .locator('main')
        .getByRole('button', { name: group, exact: true })
        .click(),
      application
        .locator('main')
        .getByRole('button', { name: group, exact: true })
        .click(),
    ]);
    const prototypeLabels = await prototype
      .locator('main button')
      .evaluateAll((buttons) =>
        buttons
          .filter((button) => button.getAttribute('aria-hidden') !== 'true')
          .map((button) => button.textContent.replace(/\s+/g, ' ').trim())
          .filter(Boolean),
      );
    const applicationLabels = await application
      .locator('main button')
      .evaluateAll((buttons) =>
        buttons
          .map((button) => button.textContent.replace(/\s+/g, ' ').trim())
          .filter(Boolean),
      );
    for (const label of prototypeLabels) {
      expect(applicationLabels).toContain(label);
    }
  }

  const placeholder = application.getByTestId('reports-preview-placeholder');
  const before = await placeholder.textContent();
  await application
    .locator('main')
    .getByRole('button', { name: 'Search', exact: true })
    .click();
  await expect(placeholder).toHaveText(before ?? '');
  await context.close();
});

const evidenceRoot = resolve('docs/migration/qa/M3.9');
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
        preparePrototype(prototype, 'reports', theme, locale),
        prepareApplication(application, '/reports', theme, locale),
      ]);
      await Promise.all([
        applyState(prototype, state),
        applyState(application, state),
      ]);
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
