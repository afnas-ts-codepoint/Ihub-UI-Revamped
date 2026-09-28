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
  | 'add-initial'
  | 'add-attachment-missing'
  | 'add-attachment-valid'
  | 'listing-open'
  | 'listing-closed'
  | 'report';

const labels = {
  add: { ar: 'Ø¥Ø¶Ø§ÙØ© Ù‚Ø§Ø¦Ù…Ø© Ù…Ù„Ø§Ø­Ù‚Ø§Øª', en: 'Add a Snag List' },
  closed: { ar: 'Closed', en: 'Closed' },
  listing: { ar: 'Ø³Ø¬Ù„ Ø§Ù„Ù…Ù„Ø§Ø­Ù‚Ø§Øª', en: 'Snag Listing' },
  report: { ar: 'ØªÙ‚Ø±ÙŠØ±', en: 'Report' },
  snagLists: { ar: 'Ù‚ÙˆØ§Ø¦Ù… Ø§Ù„Ù…Ù„Ø§Ø­Ù‚Ø§Øª Ø§Ù„ÙÙ†ÙŠØ©', en: 'Snag Lists' },
  submit: { ar: 'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©', en: 'Submit snag list' },
  workCentre: { ar: 'Ù…Ø±ÙƒØ² Ø§Ù„Ø¹Ù…Ù„', en: 'Work Centre' },
} as const;

const appPaths: Record<State, string> = {
  'add-initial': '/home/work-centre/snag-lists/add',
  'add-attachment-missing': '/home/work-centre/snag-lists/add',
  'add-attachment-valid': '/home/work-centre/snag-lists/add',
  'listing-open': '/home/work-centre/snag-lists/listing',
  'listing-closed': '/home/work-centre/snag-lists/listing',
  report: '/home/work-centre/snag-lists/report',
};

async function clickMainButton(page: Page, name: string) {
  await page.getByRole('main').getByRole('button').filter({ hasText: name }).first().click();
}

async function openPrototype(page: Page, locale: QaLocale, theme: QaTheme, state: State) {
  await preparePrototype(page, 'dashboard', theme, locale);
  await clickMainButton(page, labels.workCentre[locale]);
  await clickMainButton(page, labels.snagLists[locale]);
  if (state.startsWith('add-')) {
    await clickMainButton(page, labels.add[locale]);
  } else if (state.startsWith('listing')) {
    await clickMainButton(page, labels.listing[locale]);
    if (state === 'listing-closed') {
      await page.getByRole('main').getByRole('button', { name: /^Closed\s+2$/ }).click();
    }
  } else {
    await clickMainButton(page, labels.report[locale]);
  }
  await setAttachmentState(page, locale, state);
}

async function setAttachmentState(page: Page, locale: QaLocale, state: State) {
  if (!state.startsWith('add-attachment')) return;
  const picker = page.locator('input[type="file"]');
  await picker.setInputFiles({
    name: 'snag-photo.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('visual-qa'),
  });
  if (state === 'add-attachment-valid') {
    await page
      .getByPlaceholder(locale === 'en' ? 'Caption (required)' : 'Ø§Ù„ÙˆØµÙ (Ù…Ø·Ù„ÙˆØ¨)')
      .fill('Handover photo');
  }
}

async function openApplication(page: Page, locale: QaLocale, theme: QaTheme, state: State) {
  await prepareApplication(page, appPaths[state], theme, locale);
  await setAttachmentState(page, locale, state);
  if (state === 'listing-closed') {
    await page.getByRole('tab', { name: 'Closed 2' }).click();
  }
}

const states: readonly State[] = [
  'add-initial',
  'add-attachment-missing',
  'add-attachment-valid',
  'listing-open',
  'listing-closed',
  'report',
];

const evidenceRoot = resolve('docs/migration/qa/M7.4');

for (const state of states) {
  for (const variant of variants) {
    test(`${state} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({
        viewport: { height: state.startsWith('add-') ? 1500 : 1100, width: variant.width },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await Promise.all([
        openPrototype(prototype, variant.locale, variant.theme, state),
        openApplication(application, variant.locale, variant.theme, state),
      ]);

      if (state.startsWith('add-')) {
        await expect(application.getByRole('button', { name: labels.submit[variant.locale] })).toBeVisible();
      } else if (state.startsWith('listing')) {
        await expect(application.getByRole('table')).toBeVisible();
        await expect(application.getByRole('table')).toContainText('SNG-2026-041');
      } else {
        await expect(application.getByTestId('snag-report')).toBeVisible();
      }

      await prototype.waitForTimeout(300);
      await application.waitForTimeout(300);
      const directory = resolve(evidenceRoot, state);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(
        prototype,
        application,
        comparison,
        resolve(directory, `${String(variant.width)}-${variant.theme}-${variant.locale}.png`),
        variant.width,
        { fullPage: true },
      );
      await context.close();
    });
  }
}
