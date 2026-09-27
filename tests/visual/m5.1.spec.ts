import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { test, type Locator, type Page } from '@playwright/test';

import {
  captureSideBySide,
  prepareApplication,
  preparePrototype,
  type QaLocale,
  type QaTheme,
} from './helpers';

const evidenceRoot = resolve('docs/migration/qa/M5.1');

const fullVariants = [1440, 1040, 760, 390].flatMap((width) =>
  (['paper', 'ink'] as const).flatMap((theme) =>
    (['en', 'ar'] as const).map((locale) => ({ locale, theme, width })),
  ),
);

const reducedVariants = [
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

const slideStates = [
  { id: 'slide-1', slide: 1 },
  { id: 'slide-2', slide: 2 },
  { id: 'slide-3', slide: 3 },
  { id: 'slide-4', slide: 4 },
  { id: 'paused', pause: true, slide: 1 },
] as const;

function variantName(variant: { locale: QaLocale; theme: QaTheme; width: number }) {
  return `${String(variant.width)}-${variant.theme}-${variant.locale}`;
}

async function openHomePair(
  prototype: Page,
  application: Page,
  variant: { locale: QaLocale; theme: QaTheme; width: number },
) {
  await Promise.all([
    preparePrototype(prototype, 'dashboard', variant.theme, variant.locale),
    prepareApplication(application, '/home/overview', variant.theme, variant.locale),
  ]);
  await Promise.all([
    prototype.locator('[aria-roledescription="carousel"]').waitFor(),
    application.getByTestId('hero-carousel').waitFor(),
  ]);
}

async function setSlide(page: Page, slide: number) {
  await page
    .locator(
      `[aria-roledescription="carousel"] button[aria-label$="${String(slide)}"]`,
    )
    .click();
}

async function captureFull(
  prototype: Page,
  application: Page,
  comparison: Page,
  relativePath: string,
  width: number,
) {
  const outputPath = resolve(evidenceRoot, relativePath);
  await mkdir(resolve(outputPath, '..'), { recursive: true });
  await captureSideBySide(
    prototype,
    application,
    comparison,
    outputPath,
    width,
    { fullPage: true },
  );
}

async function captureElements(
  prototypeElement: Locator,
  applicationElement: Locator,
  comparison: Page,
  relativePath: string,
  width: number,
) {
  const [prototypePng, applicationPng] = await Promise.all([
    prototypeElement.screenshot(),
    applicationElement.screenshot(),
  ]);
  const prototypeData = `data:image/png;base64,${prototypePng.toString('base64')}`;
  const applicationData = `data:image/png;base64,${applicationPng.toString('base64')}`;
  await comparison.setViewportSize({ height: 900, width: width * 2 + 36 });
  await comparison.setContent(`<!doctype html><style>
    *{box-sizing:border-box}body{margin:0;padding:12px;background:#111;color:#fff;font:12px system-ui}
    main{display:grid;grid-template-columns:${String(width)}px ${String(width)}px;gap:12px;align-items:start}
    figure{margin:0}figcaption{padding:0 0 6px;font-weight:700}img{display:block;max-width:100%;height:auto}
  </style><main><figure><figcaption>Prototype</figcaption><img src="${prototypeData}"></figure><figure><figcaption>Migrated application</figcaption><img src="${applicationData}"></figure></main>`);
  const outputPath = resolve(evidenceRoot, relativePath);
  await mkdir(resolve(outputPath, '..'), { recursive: true });
  await comparison.screenshot({ fullPage: true, path: outputPath });
}

test.describe('M5.1 full banner matrix', () => {
  for (const state of slideStates) {
    for (const variant of fullVariants) {
      test(`${state.id}-${variantName(variant)}`, async ({ browser }) => {
        const context = await browser.newContext({
          viewport: { height: 1000, width: variant.width },
        });
        const prototype = await context.newPage();
        const application = await context.newPage();
        const comparison = await context.newPage();
        await openHomePair(prototype, application, variant);
        if (state.slide > 1) {
          await Promise.all([
            setSlide(prototype, state.slide),
            setSlide(application, state.slide),
          ]);
        }
        if ('pause' in state) {
          await Promise.all([
            prototype.locator('[aria-roledescription="carousel"]').hover(),
            application.getByTestId('hero-carousel').hover(),
          ]);
        }
        await captureElements(
          prototype.locator('[aria-roledescription="carousel"]').locator('xpath=../..'),
          application.getByTestId('home-top-banner'),
          comparison,
          `${state.id}/${variantName(variant)}.png`,
          variant.width,
        );
        await context.close();
      });
    }
  }
});

test.describe('M5.1 reduced integration evidence', () => {
  for (const variant of reducedVariants) {
    test(`ai-menu-${variantName(variant)}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { height: 1000, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await openHomePair(prototype, application, variant);
      await Promise.all([
        prototype.locator('button[aria-haspopup="menu"]').last().click(),
        application.locator('button[aria-haspopup="menu"]').last().click(),
      ]);
      await Promise.all([
        prototype.getByRole('menu').waitFor(),
        application.getByRole('menu').waitFor(),
      ]);
      await captureFull(prototype, application, comparison, `ai-menu/${variantName(variant)}.png`, variant.width);
      await context.close();
    });

    test(`checklist-${variantName(variant)}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { height: 1000, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await openHomePair(prototype, application, variant);
      const label = variant.locale === 'ar' ? 'قائمة إجراءات التشغيل' : 'SOP Checklist';
      await prototype.getByRole('button', { exact: true, name: label }).first().click();
      await application.goto(`http://127.0.0.1:4173/home/sop-checklist`, { waitUntil: 'domcontentloaded' });
      await Promise.all([
        prototype.getByText('CHK-0421').waitFor(),
        application.getByText('CHK-0421').waitFor(),
      ]);
      await captureFull(prototype, application, comparison, `checklist/${variantName(variant)}.png`, variant.width);
      await context.close();
    });

    test(`sla-${variantName(variant)}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { height: 1000, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await openHomePair(prototype, application, variant);
      const label = variant.locale === 'ar' ? 'اتفاقية مستوى الخدمة' : 'SLA & Compliance';
      await prototype.getByRole('button', { exact: true, name: label }).first().click();
      await application.goto(`http://127.0.0.1:4173/home/sla`, { waitUntil: 'domcontentloaded' });
      await Promise.all([
        prototype.getByText('316', { exact: true }).waitFor(),
        application.getByText('316', { exact: true }).waitFor(),
      ]);
      await captureFull(prototype, application, comparison, `sla/${variantName(variant)}.png`, variant.width);
      await context.close();
    });

    test(`incidents-${variantName(variant)}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { height: 1000, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await openHomePair(prototype, application, variant);
      const incidents = variant.locale === 'ar' ? /^الحوادث/ : /^Incidents/;
      const live = variant.locale === 'ar' ? 'الحوادث الحالية' : 'Live Incidents';
      await prototype.getByRole('button', { name: incidents }).first().click();
      await prototype.getByRole('button', { exact: true, name: live }).click();
      await application.goto(`http://127.0.0.1:4173/home/incidents/live`, { waitUntil: 'domcontentloaded' });
      await Promise.all([
        prototype.getByRole('button', { exact: true, name: live }).waitFor(),
        application.getByRole('button', { exact: true, name: live }).waitFor(),
      ]);
      await captureFull(prototype, application, comparison, `incidents/${variantName(variant)}.png`, variant.width);
      await context.close();
    });

    test(`task-banner-${variantName(variant)}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { height: 1000, width: variant.width } });
      const prototype = await context.newPage();
      const application = await context.newPage();
      const comparison = await context.newPage();
      await openHomePair(prototype, application, variant);
      await prototype.evaluate(() => {
        const prototypeWindow = window as unknown as {
          JOBORDERS?: unknown[];
          __ihubViewTask?: (item: unknown) => void;
        };
        prototypeWindow.__ihubViewTask?.(prototypeWindow.JOBORDERS?.[2]);
      });
      await application.goto(`http://127.0.0.1:4173/tasks/JO-7779`, { waitUntil: 'domcontentloaded' });
      const prototypeBanner = prototype.locator('[aria-roledescription="carousel"]').locator('xpath=../..');
      const applicationBanner = application.getByTestId('home-top-banner');
      await Promise.all([prototypeBanner.waitFor(), applicationBanner.waitFor()]);
      await captureElements(
        prototypeBanner,
        applicationBanner,
        comparison,
        `task-banner/${variantName(variant)}.png`,
        variant.width,
      );
      await context.close();
    });
  }
});
