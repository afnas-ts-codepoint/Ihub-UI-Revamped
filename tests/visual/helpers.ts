import type { Page } from '@playwright/test';

export type QaLocale = 'en' | 'ar';
export type QaTheme = 'paper' | 'ink';

const fixedTime = new Date('2026-09-25T08:00:00+03:00');

export async function preparePrototype(
  page: Page,
  route: string,
  theme: QaTheme,
  locale: QaLocale,
) {
  await page.clock.install({ time: fixedTime });
  await page.addInitScript((prototypeRoute) => {
    localStorage.setItem('ihub.route', prototypeRoute);
  }, route);
  await page.goto('http://127.0.0.1:4174', {
    waitUntil: 'domcontentloaded',
  });
  await page.locator('.tn-bar').waitFor();

  if (theme === 'ink') {
    await page.getByRole('button', { name: 'Toggle theme' }).click();
  }
  if (locale === 'ar') {
    await page.evaluate(() => {
      window.postMessage({ type: '__activate_edit_mode' }, '*');
    });
    await page.getByRole('button', { name: 'العربية' }).click();
    await page.evaluate(() => {
      window.postMessage({ type: '__deactivate_edit_mode' }, '*');
    });
  }
}

export async function prepareApplication(
  page: Page,
  path: string,
  theme: QaTheme,
  locale: QaLocale,
) {
  await page.clock.install({ time: fixedTime });
  await page.addInitScript(
    ({ qaLocale, qaTheme }) => {
      localStorage.setItem(
        'ihub.v2.preferences',
        JSON.stringify({
          state: { locale: qaLocale, theme: qaTheme },
          version: 0,
        }),
      );
    },
    { qaLocale: locale, qaTheme: theme },
  );
  await page.goto(`http://127.0.0.1:4173${path}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.getByRole('banner').waitFor();
}

export async function openMegaMenu(page: Page) {
  await page
    .locator('[data-testid="masters-trigger"], .tn-nav > div > button')
    .first()
    .evaluate((element: HTMLButtonElement) => {
      element.click();
    });
}

export async function openMobileDrawer(page: Page) {
  await page
    .locator('[data-testid="mobile-nav-trigger"], .tn-burger')
    .first()
    .evaluate((element: HTMLButtonElement) => {
      element.click();
    });
  await page.waitForTimeout(600);
}

export async function captureSideBySide(
  prototype: Page,
  application: Page,
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
  const imageWidth = String(width);

  await comparison.setViewportSize({ height: 900, width: width * 2 + 36 });
  await comparison.setContent(`<!doctype html><style>
    *{box-sizing:border-box}body{margin:0;padding:12px;background:#111;color:#fff;font:12px system-ui}
    main{display:grid;grid-template-columns:${imageWidth}px ${imageWidth}px;gap:12px;align-items:start}
    figure{margin:0}figcaption{padding:0 0 6px;font-weight:700}img{display:block;width:${imageWidth}px;height:auto}
  </style><main><figure><figcaption>Prototype</figcaption><img src="${prototypeData}"></figure><figure><figcaption>Migrated application</figcaption><img src="${applicationData}"></figure></main>`);
  await comparison.screenshot({ fullPage: true, path: outputPath });
}
