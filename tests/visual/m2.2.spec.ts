import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

import {
  captureSideBySide,
  openMegaMenu,
  openMobileDrawer,
  prepareApplication,
  preparePrototype,
  type QaLocale,
  type QaTheme,
} from './helpers';

type ShellState = Readonly<{
  name: string;
  path: string;
  prototypeRoute: string;
  open?: 'mega' | 'drawer';
}>;

const states: readonly ShellState[] = [
  {
    name: 'default-top-nav',
    path: '/home/overview',
    prototypeRoute: 'dashboard',
  },
  { name: 'active-home', path: '/home/overview', prototypeRoute: 'dashboard' },
  {
    name: 'active-finance',
    path: '/finance/dashboard',
    prototypeRoute: 'budgeting/dashboard',
  },
  {
    name: 'active-hr',
    path: '/hr/overtime/verify',
    prototypeRoute: 'overtime/overtime/verify',
  },
  { name: 'active-appraisal', path: '/appraisal', prototypeRoute: 'appraisal' },
  {
    name: 'active-quality',
    path: '/quality/quality-assurance-checklists/risk-levels',
    prototypeRoute: 'checklist/quality-assurance-checklists/risk-levels',
  },
  {
    name: 'active-history',
    path: '/history/work-centre/tasks',
    prototypeRoute: 'history/work-centre/tasks',
  },
  { name: 'active-workflows', path: '/workflows', prototypeRoute: 'workflows' },
  {
    name: 'masters-admin',
    path: '/masters/admin/project-category-master',
    prototypeRoute: 'masters/admin/project-category-master',
    open: 'mega',
  },
  {
    name: 'masters-general',
    path: '/masters/general/machine-master',
    prototypeRoute: 'masters/general/machine-master',
    open: 'mega',
  },
  {
    name: 'masters-hr',
    path: '/masters/hr/appraisal-deduction',
    prototypeRoute: 'masters/hr/appraisal-deduction',
    open: 'mega',
  },
  {
    name: 'masters-operation',
    path: '/masters/operation/assignment-areas',
    prototypeRoute: 'masters/operation/assignment-areas',
    open: 'mega',
  },
  {
    name: 'mobile-drawer-expanded',
    path: '/hr/overtime/verify',
    prototypeRoute: 'overtime/overtime/verify',
    open: 'drawer',
  },
  {
    name: 'secondary-l2',
    path: '/finance/dashboard',
    prototypeRoute: 'budgeting/dashboard',
  },
  {
    name: 'secondary-l3',
    path: '/hr/overtime/verify',
    prototypeRoute: 'overtime/overtime/verify',
  },
  {
    name: 'masters-list-strips',
    path: '/masters-list/admin/project-category-master',
    prototypeRoute: 'masters-list/admin/project-category-master',
  },
];
const widths = [1440, 1040, 760, 390] as const;
const themes: readonly QaTheme[] = ['paper', 'ink'];
const locales: readonly QaLocale[] = ['en', 'ar'];
const evidenceRoot = resolve('docs/migration/qa/M2.2');

test('active shell styles survive the global element reset', async ({
  page,
}) => {
  await prepareApplication(
    page,
    '/masters/general/machine-master',
    'paper',
    'en',
  );
  await openMegaMenu(page);

  const activeCategory = page
    .getByTestId('mega-menu')
    .getByRole('button', { name: /General/ });
  await expect(activeCategory).toHaveCSS(
    'background-color',
    'rgba(147, 53, 141, 0.14)',
  );
  await expect(activeCategory).toHaveCSS('color', 'rgb(147, 53, 141)');
  await expect(activeCategory).toHaveCSS('font-weight', '600');
});

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
            state.prototypeRoute,
            theme,
            locale,
          );
          await prepareApplication(application, state.path, theme, locale);

          if (state.open === 'mega') {
            await openMegaMenu(prototype);
            await openMegaMenu(application);
          }
          if (state.open === 'drawer') {
            await openMobileDrawer(prototype);
            await openMobileDrawer(application);
          }

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
