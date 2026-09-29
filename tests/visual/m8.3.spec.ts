import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { expect, test, type Locator, type Page } from '@playwright/test';

import {
  prepareApplication,
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

const evidenceRoot = resolve('docs/migration/qa/M8.3');

async function openPrototype(
  page: Page,
  locale: QaLocale,
  theme: QaTheme,
) {
  await page.clock.install({ time: new Date('2026-09-25T08:00:00+03:00') });
  await page.goto('http://127.0.0.1:4174/ihub/', {
    waitUntil: 'domcontentloaded',
  });
  await page.getByRole('banner').waitFor();
  if (theme === 'ink') {
    await page.getByRole('button', { name: 'Toggle theme' }).click();
  }
  await page.waitForFunction(
    () =>
      typeof (
        window as typeof window & { CreateTaskPanel?: unknown }
      ).CreateTaskPanel === 'function',
  );
  await page.evaluate((qaLocale) => {
    const runtime = window as typeof window & {
      CreateTaskPanel: unknown;
      React: { createElement: (type: unknown, props: unknown) => unknown };
      ReactDOM: {
        createRoot: (element: Element) => { render: (node: unknown) => void };
      };
    };
    const main = document.querySelector('main');
    if (!main) throw new Error('Prototype main region was not found');
    main.replaceChildren();
    const host = document.createElement('div');
    host.id = 'm8-3-prototype-host';
    main.append(host);
    runtime.ReactDOM.createRoot(host).render(
      runtime.React.createElement(runtime.CreateTaskPanel, {
        embedded: true,
        locale: qaLocale,
      }),
    );
  }, locale);
  await page.locator('.ctp-cards-grid').waitFor();
}

async function captureComponentComparison(
  prototype: Locator,
  application: Locator,
  comparison: Page,
  outputPath: string,
  width: number,
) {
  const [prototypePng, applicationPng] = await Promise.all([
    prototype.screenshot(),
    application.screenshot(),
  ]);
  const prototypeData = `data:image/png;base64,${prototypePng.toString('base64')}`;
  const applicationData = `data:image/png;base64,${applicationPng.toString('base64')}`;
  await comparison.setViewportSize({ height: 900, width: width * 2 + 36 });
  await comparison.setContent(
    `<!doctype html><style>*{box-sizing:border-box}body{margin:0;padding:12px;background:#111;color:#fff;font:12px system-ui}main{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}figure{margin:0;min-width:0}figcaption{padding:0 0 6px;font-weight:700}img{display:block;width:100%;height:auto}</style><main><figure><figcaption>Current prototype canonical form</figcaption><img src="${prototypeData}"></figure><figure><figcaption>Migrated application form</figcaption><img src="${applicationData}"></figure></main>`,
    { waitUntil: 'domcontentloaded' },
  );
  await comparison.waitForFunction(() =>
    [...document.images].every(
      (candidate) => candidate.complete && candidate.naturalWidth > 0,
    ),
  );
  await comparison.screenshot({ fullPage: true, path: outputPath });
}

async function choose(page: Page, label: string, option: string) {
  const combobox = page.getByRole('combobox', { name: label });
  await combobox.focus();
  await page.getByRole('option', { exact: true, name: option }).click();
}

for (const variant of variants) {
  test(`baseline ${String(variant.width)} ${variant.theme} ${variant.locale}`, async ({
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
      openPrototype(prototype, variant.locale, variant.theme),
      prepareApplication(
        application,
        '/home/work-centre/create-task',
        variant.theme,
        variant.locale,
      ),
    ]);

    await expect(application).toHaveURL(/\/home\/work-centre\/create-task$/);
    await expect(application.getByTestId('create-task-page')).toBeVisible();
    await expect(
      application.getByRole('heading', {
        name: variant.locale === 'ar' ? 'تفاصيل المهمة' : 'Task Details',
      }),
    ).toBeVisible();

    const directory = resolve(
      evidenceRoot,
      `${String(variant.width)}-${variant.theme}-${variant.locale}`,
    );
    await mkdir(directory, { recursive: true });
    await application.screenshot({
      fullPage: true,
      path: resolve(directory, 'default.png'),
    });
    await captureComponentComparison(
      prototype.locator('.ctp-create-section'),
      application.getByTestId('create-task-page'),
      comparison,
      resolve(directory, 'default-comparison.png'),
      variant.width,
    );
    await context.close();
  });
}

test('interaction evidence', async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({
    viewport: { height: 1100, width: 1440 },
  });
  const application = await context.newPage();
  await prepareApplication(
    application,
    '/home/work-centre/create-task',
    'paper',
    'en',
  );
  await mkdir(evidenceRoot, { recursive: true });

  await application.getByLabel('Task subject').fill('Inspect VR platform');
  await application.getByLabel('Project Name').fill('Autumn readiness');
  await application
    .getByLabel('Details')
    .fill('Inspect the platform before the weekend opening.');
  await application.getByRole('button', { name: 'High' }).first().click();
  await application
    .screenshot({ fullPage: true, path: resolve(evidenceRoot, 'populated.png') });

  await choose(application, 'Location', '360 Mall');
  await choose(application, 'Zone', 'Wonder Zone');
  await application.getByRole('button', { exact: true, name: 'Add' }).click();
  await expect(application.getByTestId('location-row')).toBeVisible();
  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'location-added.png'),
  });

  await application.getByRole('button', { name: 'Scan QR Code' }).click();
  await expect(application.getByRole('dialog')).toBeVisible();
  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'qr-dialog.png'),
  });
  await application.getByRole('button', { name: 'Simulate Scan' }).click();
  await expect(application.getByLabel('Asset Code')).toHaveValue(/AST-2026-\d{4}/);
  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'qr-result.png'),
  });

  await application.getByLabel('Click to upload or drag and drop').setInputFiles({
    buffer: Buffer.from('M8.3 visual QA attachment'),
    mimeType: 'text/plain',
    name: 'visual-qa.txt',
  });
  await expect(application.getByText('visual-qa.txt')).toBeVisible();
  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'attachment.png'),
  });

  await application.getByRole('button', { name: 'Create task' }).click();
  await expect(application.getByRole('status')).toHaveText('Task created');
  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'post-submit.png'),
  });

  await application.getByRole('link', { exact: true, name: 'Tasks' }).click();
  await expect(application).toHaveURL(/\/home\/work-centre\/tasks$/);
  await expect(application.locator('tbody tr').first()).toContainText(
    'Inspect VR platform',
  );
  await application.screenshot({
    fullPage: true,
    path: resolve(evidenceRoot, 'created-task-list.png'),
  });
  await context.close();
});
