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
  | 'batch'
  | 'drawer'
  | 'form-action-sheet'
  | 'form-budget'
  | 'form-petty-cash'
  | 'queue'
  | 'send-back'
  | 'track-prompt';

type Variant = Readonly<{
  locale: QaLocale;
  states: readonly State[];
  theme: QaTheme;
  width: number;
}>;

const allStates: readonly State[] = [
  'queue',
  'batch',
  'drawer',
  'form-action-sheet',
  'form-petty-cash',
  'form-budget',
  'send-back',
  'track-prompt',
];

const variants: readonly Variant[] = [
  { locale: 'en', states: allStates, theme: 'paper', width: 1440 },
  { locale: 'en', states: ['queue', 'drawer', 'form-action-sheet'], theme: 'ink', width: 1440 },
  { locale: 'ar', states: allStates, theme: 'paper', width: 1440 },
  { locale: 'en', states: ['queue', 'batch', 'drawer', 'form-budget'], theme: 'paper', width: 760 },
  { locale: 'en', states: ['queue', 'drawer', 'send-back'], theme: 'paper', width: 390 },
];

const titles = {
  a1: 'Budget Release — Eid Activation, 360 Mall',
  a2: 'Purchase Approval (PC) — Cinema Projector Units ×2',
  a3: 'Action Sheet — Crowd Safety Plan, Summer Festival',
  a4: 'Petty Cash — Al Kout Venue Float Top-up',
} as const;

const buttonTitles = {
  approve: { ar: 'موافقة', en: 'Approve' },
  sendBack: { ar: 'إعادة', en: 'Send back' },
} as const;

async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme) {
  await preparePrototype(page, 'dashboard', theme, locale);
  // The prototype Approvals view has no tab: it is reached from the Overview "On the clock" queue buttons.
  const queueButton = page
    .locator('button.btn.ghost.sm')
    .filter({ hasText: locale === 'ar' ? /^الموافقات/ : /^Approvals/ })
    .first();
  await queueButton.scrollIntoViewIfNeeded();
  await queueButton.click();
  await page.getByText(titles.a1).first().waitFor();
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
}

async function openApplication(page: Page, locale: QaLocale, theme: QaTheme) {
  await prepareApplication(page, '/home/approvals', theme, locale);
  await page.getByText(titles.a1).first().waitFor();
}

async function drive(page: Page, locale: QaLocale, state: State) {
  switch (state) {
    case 'queue':
      await page.getByText(titles.a1).first().scrollIntoViewIfNeeded();
      break;
    case 'batch':
      await page.getByText(titles.a1).first().scrollIntoViewIfNeeded();
      await page.locator('input[type=checkbox]').nth(0).check();
      await page.locator('input[type=checkbox]').nth(1).check();
      break;
    case 'drawer':
      await page.getByText(titles.a2).first().click();
      break;
    case 'form-action-sheet':
      await page.getByText(titles.a3).first().click();
      break;
    case 'form-petty-cash':
      await page.getByText(titles.a4).first().click();
      break;
    case 'form-budget':
      await page.getByText(titles.a1).first().click();
      break;
    case 'send-back':
      await page.getByTitle(buttonTitles.sendBack[locale], { exact: true }).first().click();
      break;
    case 'track-prompt':
      await page.getByTitle(buttonTitles.approve[locale], { exact: true }).first().click();
      break;
  }
  await page.waitForTimeout(600);
}

const evidenceRoot = resolve('docs/migration/qa/M10.1');

for (const variant of variants) {
  for (const state of variant.states) {
    test(`${state} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({ viewport: { height: 1100, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await Promise.all([
        openPrototype(prototype, variant.locale, variant.theme),
        openApplication(application, variant.locale, variant.theme),
      ]);
      await Promise.all([
        drive(prototype, variant.locale, state),
        drive(application, variant.locale, state),
      ]);

      if (variant.locale === 'ar') {
        await expect(application.locator('html')).toHaveAttribute('dir', 'rtl');
      }
      // No horizontal page scroll at any width.
      const overflow = await application.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);

      const directory = resolve(evidenceRoot, state);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(
        prototype,
        application,
        comparison,
        resolve(directory, `${String(variant.width)}-${variant.theme}-${variant.locale}.png`),
        variant.width,
      );
      await context.close();
    });
  }
}
