import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

import { prepareApplication, type QaLocale, type QaTheme } from './helpers';

const variants = [
  { locale: 'en', theme: 'paper', width: 1440, tag: 'en-paper-1440' },
  { locale: 'ar', theme: 'ink', width: 1440, tag: 'ar-ink-1440' },
  { locale: 'en', theme: 'ink', width: 760, tag: 'en-ink-760' },
  { locale: 'ar', theme: 'paper', width: 390, tag: 'ar-paper-390' },
] as const satisfies readonly {
  locale: QaLocale;
  tag: string;
  theme: QaTheme;
  width: number;
}[];

const surfaces = [
  ['overview', '/home/overview'],
  ['approvals', '/home/approvals'],
  ['assigned', '/home/assigned/approvals'],
  ['incidents-reports', '/home/incidents/reports'],
  ['incidents-live', '/home/incidents/live'],
  ['company', '/home/company'],
  ['home-reports', '/home/reports'],
  ['work-centre-enquiry', '/home/work-centre/enquiry/add'],
  ['tasks-list', '/home/work-centre/tasks'],
  ['create-task', '/home/work-centre/create-task'],
  ['task-view', '/tasks/T-001'],
  ['task-edit', '/tasks/T-001/edit'],
  ['purchasing', '/home/purchasing/create'],
  ['budgeting', '/home/budgets/budget-sheet'],
  ['payment-settlement', '/home/payment-settlement/action-sheet'],
  ['masters', '/masters/admin/project-category-master'],
  ['reports-library', '/reports'],
  ['settings-config', '/settings/configuration'],
  ['sla', '/sla'],
  ['workflows', '/workflows'],
  ['notifications', '/notifications'],
  ['overtime', '/hr/overtime'],
] as const;

const evidenceRoot = resolve('docs/migration/qa/M12.1');

test('M12.1 representative visual and health sweep', async ({ browser }) => {
  test.setTimeout(1_200_000);
  await mkdir(evidenceRoot, { recursive: true });
  const results: Record<string, unknown>[] = [];

  for (const variant of variants) {
    const context = await browser.newContext({
      viewport: { height: 900, width: variant.width },
    });
    const page = await context.newPage();
    let current = '';
    const issues: Record<string, string[]> = {};
    const note = (message: string) => {
      (issues[current] ??= []).push(message);
    };
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        note(`console.${message.type()}: ${message.text().slice(0, 160)}`);
      }
    });
    page.on('pageerror', (error) => {
      note(`pageerror: ${error.message.slice(0, 160)}`);
    });

    for (const [name, path] of surfaces) {
      current = `${name}@${variant.tag}`;
      await prepareApplication(page, path, variant.theme, variant.locale);
      await page.waitForTimeout(400);
      const health = await page.evaluate(() => {
        const doc = document.documentElement;
        const text = document.body.innerText;
        return {
          dir: doc.dir,
          lang: doc.lang,
          leakedKeys: text.match(/\b[a-z][A-Za-z]+(?:\.[a-zA-Z]+){2,}\b/g)?.slice(0, 3) ?? [],
          overflowX: doc.scrollWidth > doc.clientWidth + 1,
          pending: document.querySelector('[data-migration-pending]') !== null,
          scrollWidth: doc.scrollWidth,
        };
      });
      await page.screenshot({
        fullPage: true,
        path: resolve(evidenceRoot, `${name}__${variant.tag}.png`),
      });
      results.push({ name, tag: variant.tag, ...health, issues: issues[current] ?? [] });
    }
    await context.close();
  }

  await writeFile(
    resolve(evidenceRoot, 'health.json'),
    JSON.stringify(results, null, 1),
  );
  expect(results.length).toBe(surfaces.length * variants.length);
});
