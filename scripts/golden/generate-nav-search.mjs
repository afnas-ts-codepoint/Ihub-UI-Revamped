import { readFile, writeFile } from 'node:fs/promises';
import { URL } from 'node:url';

import { chromium } from '@playwright/test';

const prototypeUrl = process.env.PROTOTYPE_URL ?? 'http://127.0.0.1:4174';
const queriesUrl = new URL('./nav-search.queries.json', import.meta.url);
const fixtureUrl = new URL('./nav-search.fixture.json', import.meta.url);
const queries = JSON.parse(await readFile(queriesUrl, 'utf8'));
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  await page.goto(prototypeUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('.tn-bar').waitFor();

  const cases = await page.evaluate(
    (goldenQueries) =>
      goldenQueries.map(({ locale, query }) => ({
        locale,
        query,
        resultKeys: globalThis
          .navSearch(query, locale)
          .map((entry) => entry.key),
      })),
    queries,
  );

  await writeFile(
    fixtureUrl,
    `${JSON.stringify({ baseline: '273abc8', cases }, null, 2)}\n`,
    'utf8',
  );
} finally {
  await browser.close();
}
