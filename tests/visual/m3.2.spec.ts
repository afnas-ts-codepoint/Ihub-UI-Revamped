import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { test } from '@playwright/test';

import {
  captureSideBySide,
  prepareApplication,
  preparePrototype,
  type QaLocale,
  type QaTheme,
} from './helpers';

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

const states = ['section', 'report'] as const;
const evidenceRoot = resolve('docs/migration/qa/M3.2');

for (const state of states) {
  for (const { locale, theme, width } of variants) {
    test(`${state} ${String(width)} ${theme} ${locale}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { height: 900, width },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await preparePrototype(prototype, 'appraisal', theme, locale);
      await prepareApplication(application, '/appraisal', theme, locale);
      if (state === 'report') {
        const label = locale === 'ar' ? 'تقرير' : 'Report';
        await Promise.all([
          prototype.getByRole('button', { name: label, exact: true }).click(),
          application.getByRole('button', { name: label, exact: true }).click(),
        ]);
      }
      await Promise.all([
        prototype.locator('table').first().waitFor(),
        application.locator('table').first().waitFor(),
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
