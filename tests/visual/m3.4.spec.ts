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
const evidenceRoot = resolve('docs/migration/qa/M3.4');

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

      // Unlike Overtime/Appraisal, 'notifications' is not a NAV_INDEX-registered
      // left-nav node, so the prototype's persisted-route restore (which only
      // honors known NAV_INDEX keys) cannot reload straight into it. Reach it
      // the same way a real user does: open the bell and click View all.
      await preparePrototype(prototype, 'dashboard', theme, locale);
      // The bell trigger's `title` is hardcoded English in the prototype
      // itself (not run through `T(...)`), so its accessible name is
      // "Notifications" in both locales.
      await prototype
        .getByRole('button', { name: 'Notifications', exact: true })
        .click();
      const viewAllLabel =
        locale === 'ar' ? 'عرض كل الإشعارات' : 'View all notifications';
      await prototype.getByRole('button', { name: viewAllLabel }).click();

      await prepareApplication(application, '/notifications', theme, locale);
      await Promise.all([
        prototype.locator('table').first().waitFor(),
        application.locator('table').first().waitFor(),
      ]);

      if (state === 'report') {
        const label = locale === 'ar' ? 'تقرير' : 'Report';
        await Promise.all([
          prototype.getByRole('button', { name: label, exact: true }).click(),
          application.getByRole('button', { name: label, exact: true }).click(),
        ]);
      }

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
