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

type State = 'create' | 'edit-filled' | 'fill' | 'sequence';

const childLabels = {
  create: { ar: 'إنشاء', en: 'Create' },
  'edit-filled': { ar: 'تعديل قائمة معبأة', en: 'Edit Filled Checklist' },
  fill: { ar: 'تعبئة', en: 'Fill' },
  sequence: { ar: 'تسلسل', en: 'Sequence' },
} as const;

const checklistLabels = { ar: 'قوائم المراجعة', en: 'Checklists' } as const;
const workCentreLabels = { ar: 'مركز العمل', en: 'Work Centre' } as const;

async function clickMainButton(page: Page, name: string) {
  await page
    .getByRole('main')
    .getByRole('button', { exact: true, name })
    .first()
    .click();
}

async function openPrototype(
  page: Page,
  locale: QaLocale,
  theme: QaTheme,
  state: State,
) {
  await preparePrototype(page, 'dashboard', theme, locale);
  await clickMainButton(page, workCentreLabels[locale]);
  await clickMainButton(page, checklistLabels[locale]);
  if (state !== 'create') {
    await clickMainButton(page, childLabels[state][locale]);
  }
}

async function openApplication(
  page: Page,
  locale: QaLocale,
  theme: QaTheme,
  state: State,
) {
  await prepareApplication(
    page,
    `/home/work-centre/checklists/${state}`,
    theme,
    locale,
  );
}

const states: readonly State[] = ['create', 'sequence', 'fill', 'edit-filled'];
const evidenceRoot = resolve('docs/migration/qa/M7.6');

for (const state of states) {
  for (const variant of variants) {
    test(`${state} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({
      browser,
    }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({
        viewport: { height: 1100, width: variant.width },
      });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();

      await Promise.all([
        openPrototype(prototype, variant.locale, variant.theme, state),
        openApplication(application, variant.locale, variant.theme, state),
      ]);

      await expect(application.getByTestId('work-centre-fallback')).toBeVisible();
      await expect(application.getByRole('table')).toContainText('ENQ-118');
      await expect(
        application.getByRole('link', {
          exact: true,
          name: childLabels[state][variant.locale],
        }),
      ).toHaveAttribute('aria-current', 'page');

      await prototype.waitForTimeout(300);
      await application.waitForTimeout(300);
      const directory = resolve(evidenceRoot, state);
      await mkdir(directory, { recursive: true });
      await captureSideBySide(
        prototype,
        application,
        comparison,
        resolve(
          directory,
          `${String(variant.width)}-${variant.theme}-${variant.locale}.png`,
        ),
        variant.width,
        { fullPage: true },
      );
      await context.close();
    });
  }
}
