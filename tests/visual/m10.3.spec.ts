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
  | 'assigned-approvals'
  | 'assigned-filtered'
  | 'assigned-task-rows'
  | 'assigned-tasks'
  | 'assigned-verify'
  | 'incident-menu'
  | 'live-incidents'
  | 'task-form';

type Surface = 'assigned' | 'live';

type Variant = Readonly<{
  locale: QaLocale;
  states: readonly State[];
  theme: QaTheme;
  width: number;
}>;

const allStates: readonly State[] = [
  'assigned-approvals',
  'assigned-verify',
  'assigned-tasks',
  'assigned-task-rows',
  'assigned-filtered',
  'live-incidents',
  'incident-menu',
  'task-form',
];

// Reduced matrix (Phase 3 §3.3): 1440 Paper EN, 1440 Ink EN, 1440 Paper AR, 760 Paper EN, 390 Paper EN.
const variants: readonly Variant[] = [
  { locale: 'en', states: allStates, theme: 'paper', width: 1440 },
  { locale: 'en', states: ['assigned-approvals', 'assigned-tasks', 'live-incidents'], theme: 'ink', width: 1440 },
  { locale: 'ar', states: allStates, theme: 'paper', width: 1440 },
  { locale: 'en', states: ['assigned-approvals', 'assigned-tasks', 'live-incidents', 'incident-menu'], theme: 'paper', width: 760 },
  { locale: 'en', states: ['assigned-approvals', 'live-incidents'], theme: 'paper', width: 390 },
];

const text = {
  approvals: { ar: 'الموافقات', en: 'Approvals' },
  assignedTab: { ar: 'المُسند', en: 'Assigned' },
  assignedTasks: { ar: 'المهام المسندة', en: 'Assigned Tasks' },
  incidentsTab: { ar: 'الحوادث', en: 'Incidents' },
  liveIncidents: { ar: 'الحوادث الحالية', en: 'Live Incidents' },
  incidentCenter: { ar: 'مركز الحوادث', en: 'Incident center' },
  action: { ar: 'إجراء', en: 'Action' },
  verify: { ar: 'التحقق', en: 'Verify' },
  budgets: { ar: 'موافقات الميزانية', en: 'Budget approvals' },
  tasksType: { ar: 'مهام الموافقة', en: 'Approve tasks' },
  signage: { en: 'Install digital signage — main concourse' },
  escalator: { en: 'Repair escalator B2' },
} as const;

const surfaceOf = (state: State): Surface =>
  state === 'live-incidents' || state === 'incident-menu' ? 'live' : 'assigned';

/** The prototype's sub-tab buttons carry a count badge, so match by text prefix. */
const prototypeTab = (page: Page, label: string) =>
  page.locator('button').filter({ hasText: new RegExp(`^${label}\\s*\\d*$`) });

async function openPrototype(page: Page, surface: Surface, locale: QaLocale, theme: QaTheme) {
  await preparePrototype(page, 'dashboard', theme, locale);
  if (surface === 'assigned') {
    await page.locator('button').filter({ hasText: text.assignedTab[locale] }).first().click();
    await prototypeTab(page, text.approvals[locale]).first().waitFor();
  } else {
    await page.locator('button').filter({ hasText: text.incidentsTab[locale] }).first().click();
    await page.getByRole('button', { name: text.liveIncidents[locale] }).click();
    await page.getByText(text.incidentCenter[locale], { exact: true }).first().waitFor();
  }
}

async function openApplication(page: Page, surface: Surface, locale: QaLocale, theme: QaTheme) {
  await prepareApplication(
    page,
    surface === 'assigned' ? '/home/assigned/approvals' : '/home/incidents/live',
    theme,
    locale,
  );
  if (surface === 'assigned') {
    await page.getByTestId('assigned-tabs').waitFor();
  } else {
    await page.getByText(text.incidentCenter[locale], { exact: true }).first().waitFor();
  }
}

async function selectRecordType(page: Page, label: string, prototype: boolean) {
  if (prototype) {
    // The prototype turns every <select> into a searchable text input with an option list.
    await page.locator('input[type="text"][placeholder*="("]').first().click();
    await page.getByText(new RegExp(`^${label}`)).first().click();
    return;
  }
  const select = page.getByRole('combobox').first();
  const options = await select.locator('option').allTextContents();
  const match = options.find((option) => option.trim().startsWith(label));
  if (!match) throw new Error(`No record type option starts with ${label}`);
  await select.selectOption({ label: match });
}

async function drive(page: Page, locale: QaLocale, state: State, prototype: boolean) {
  const tab = (label: string) =>
    prototype
      ? prototypeTab(page, label).first()
      : page.getByTestId('assigned-tabs').getByRole('button', { name: new RegExp(`^${label}`) });
  switch (state) {
    case 'assigned-verify':
      await tab(text.verify[locale]).click();
      break;
    case 'assigned-tasks':
      await tab(text.assignedTasks[locale]).click();
      break;
    case 'assigned-task-rows':
      await selectRecordType(page, text.tasksType[locale], prototype);
      break;
    case 'assigned-filtered':
      await selectRecordType(page, text.budgets[locale], prototype);
      break;
    case 'incident-menu':
      await page.getByRole('button', { name: text.action[locale], exact: true }).first().click();
      break;
    case 'task-form':
      await tab(text.assignedTasks[locale]).click();
      await page.getByText(text.escalator.en).first().click();
      break;
    default:
      break;
  }
  await page.waitForTimeout(700);
}

const evidenceRoot = resolve('docs/migration/qa/M10.3');

for (const variant of variants) {
  for (const state of variant.states) {
    test(`${state} ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({ viewport: { height: 1100, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      const surface = surfaceOf(state);

      await Promise.all([
        openPrototype(prototype, surface, variant.locale, variant.theme),
        openApplication(application, surface, variant.locale, variant.theme),
      ]);
      await Promise.all([
        drive(prototype, variant.locale, state, true),
        drive(application, variant.locale, state, false),
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
        { fullPage: state !== 'task-form' },
      );
      await context.close();
    });
  }
}
