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

const historyLeaves = [
  'work-centre/tasks',
  'work-centre/enquiry',
  'work-centre/observations',
  'work-centre/incidents',
  'work-centre/checklists',
  'work-centre/price-change',
  'work-centre/promotions',
  'finance-budgets/new-budget',
  'finance-budgets/additional-budget',
  'finance-budgets/transfer-fund',
  'finance-budgets/payment-settlement',
  'finance-budgets/petty-cash',
  'hr/overtime',
  'hr/investigations',
  'hr/violations',
  'hr/loan',
  'hr/end-of-probation',
  'hr/exit-interview',
  'appraisal',
  'quality-compliance/observations',
  'quality-compliance/quality-assurance-checklists',
  'purchasing',
  'sop-checklist',
] as const;

function toneFromClass(className: string) {
  if (className.includes('warn')) return 'warn';
  if (className.includes('bad')) return 'bad';
  if (className.includes('ok')) return 'ok';
  return '';
}

async function tableEvidence(page: Page) {
  const table = page.locator('table').first();
  await table.waitFor();
  const rows = await table.locator('tbody tr').evaluateAll((elements) =>
    elements.map((row) =>
      [...row.querySelectorAll('td')].map((cell) =>
        cell.textContent.replace(/\s+/g, ' ').trim(),
      ),
    ),
  );
  const tones = await table.locator('tbody tr td:nth-child(3) span').evaluateAll(
    (elements) => elements.map((element) => element.getAttribute('class') ?? ''),
  );
  const heading = (await page.locator('h1').first().textContent())?.trim();
  const placeholder = await page
    .locator('input[placeholder*="type a subject"]')
    .getAttribute('placeholder');

  return {
    heading,
    placeholder,
    rows,
    tones: tones.map(toneFromClass),
  };
}

for (const leaf of historyLeaves) {
  test(`leaf parity ${leaf}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { height: 900, width: 1440 },
    });
    const prototype = await context.newPage();
    const application = await context.newPage();

    await Promise.all([
      preparePrototype(prototype, `history/${leaf}`, 'paper', 'en'),
      prepareApplication(application, `/history/${leaf}`, 'paper', 'en'),
    ]);
    const [prototypeEvidence, applicationEvidence] = await Promise.all([
      tableEvidence(prototype),
      tableEvidence(application),
    ]);

    expect(prototypeEvidence.rows).toHaveLength(10);
    expect(applicationEvidence).toEqual(prototypeEvidence);
    await context.close();
  });
}

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

type VisualState = Readonly<{
  applicationPath: string;
  id: string;
  interaction?: 'filter' | 'report';
  prototypeRoute: string;
}>;

const states: readonly VisualState[] = [
  {
    id: 'tasks',
    prototypeRoute: 'history/work-centre/tasks',
    applicationPath: '/history/work-centre/tasks',
  },
  {
    id: 'payment-settlement',
    prototypeRoute: 'history/finance-budgets/payment-settlement',
    applicationPath: '/history/finance-budgets/payment-settlement',
  },
  {
    id: 'purchasing',
    prototypeRoute: 'history/purchasing',
    applicationPath: '/history/purchasing',
  },
  {
    id: 'filter-dialog',
    prototypeRoute: 'history/work-centre/tasks',
    applicationPath: '/history/work-centre/tasks',
    interaction: 'filter' as const,
  },
  {
    id: 'report',
    prototypeRoute: 'history/work-centre/tasks',
    applicationPath: '/history/work-centre/tasks',
    interaction: 'report' as const,
  },
] as const;

const evidenceRoot = resolve('docs/migration/qa/M3.6');

async function applyState(
  page: Page,
  interaction: 'filter' | 'report' | undefined,
  locale: QaLocale,
) {
  if (interaction === 'filter') {
    const label = locale === 'ar' ? 'المرشّحات' : 'Filters';
    await page.getByRole('button', { name: label }).click();
  }
  if (interaction === 'report') {
    const label = locale === 'ar' ? 'تقرير' : 'Report';
    await page.getByRole('button', { exact: true, name: label }).click();
    await page.locator('h2').first().waitFor();
  }
}

for (const state of states) {
  for (const { locale, theme, width } of variants) {
    test(`capture ${state.id} ${String(width)} ${theme} ${locale}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { height: 900, width },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await Promise.all([
        preparePrototype(prototype, state.prototypeRoute, theme, locale),
        prepareApplication(application, state.applicationPath, theme, locale),
      ]);
      await Promise.all([
        prototype.locator('table').first().waitFor(),
        application.locator('table').first().waitFor(),
      ]);
      await Promise.all([
        applyState(prototype, state.interaction, locale),
        applyState(application, state.interaction, locale),
      ]);

      const directory = resolve(evidenceRoot, state.id);
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
