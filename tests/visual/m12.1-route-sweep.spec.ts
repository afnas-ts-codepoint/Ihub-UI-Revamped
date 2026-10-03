import { readFileSync, writeFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

type Routes = {
  nav: { id: string; path: string }[];
  masters: { path: string; listPath: string }[];
};

const routes = JSON.parse(
  readFileSync('test-results/m121/routes.json', 'utf8'),
) as Routes;

const extra = [
  '/',
  '/home',
  '/home/work-centre',
  '/home/work-centre/incidents',
  '/home/work-centre/tasks',
  '/home/work-centre/create-task',
  '/home/work-centre/enquiry/add',
  '/home/work-centre/enquiry/history',
  '/home/work-centre/observations/add',
  '/home/work-centre/snag-lists/add',
  '/home/work-centre/checklists/create',
  '/home/work-centre/price-change',
  '/home/work-centre/promotions',
  '/home/approvals',
  '/home/assigned/approvals',
  '/home/assigned/verify',
  '/home/incidents/reports',
  '/home/incidents/live',
  '/home/company',
  '/home/tasks',
  '/home/reports',
  '/home/purchasing',
  '/home/budgets',
  '/home/payment-settlement',
  '/home/payment-settlement/petty-cash',
  '/home/payment-settlement/add-supplier',
  '/tasks/TSK-2026-001',
  '/tasks/TSK-2026-001/edit',
  '/tasks/does-not-exist',
  '/tasks/does-not-exist/edit',
  '/settings/configuration',
  '/reports',
  '/finance',
  '/definitely/not/a/route',
  '/masters/admin/not-a-master',
];

const all = [
  ...new Set([
    ...routes.nav.map((n) => n.path),
    ...routes.masters.flatMap((m) => [m.path, m.listPath]),
    ...extra,
  ]),
];

const report: Record<string, unknown>[] = [];

test('route sweep', async ({ page }) => {
  test.setTimeout(900_000);
  let current = '';
  const issues: Record<string, string[]> = {};
  const note = (m: string) => {
    (issues[current] ??= []).push(m);
  };
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      note(`console.${msg.type()}: ${msg.text().slice(0, 200)}`);
    }
  });
  page.on('pageerror', (e) => {
    note(`pageerror: ${e.message.slice(0, 200)}`);
  });
  page.on('requestfailed', (r) => {
    note(`requestfailed: ${r.url()}`);
  });

  for (const path of all) {
    current = path;
    await page.goto(`http://127.0.0.1:4173${path}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(250);
    const info = await page.evaluate(() => ({
      pending: document
          .querySelector('[data-migration-pending]')
          ?.getAttribute('data-migration-pending') ?? null,
      h1: document.querySelector('h1')?.textContent.slice(0, 60) ?? null,
      main: (document.querySelector('main')?.textContent ?? '').trim().length,
      url: location.pathname,
      notFound: /not found|404/i.test(document.body.innerText.slice(0, 600)),
      overflowX:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    }));
    report.push({ path, ...info, issues: issues[path] ?? [] });
  }
  writeFileSync(
    'test-results/m121/route-sweep.json',
    JSON.stringify(report, null, 1),
  );
  expect(report.length).toBe(all.length);
});
