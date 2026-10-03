import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const outputDirectory = 'dist';
const forbiddenStrings = [
  '__activate_edit_mode',
  '__deactivate_edit_mode',
  '__ihubShowErr',
  'ihubPreview',
  'ihub-dev-lng-switch',
  '__ihubToggleTheme',
  'Tweaks',
];

const indexPath = join(outputDirectory, 'index.html');

if (!existsSync(indexPath)) {
  throw new Error('Build output is missing dist/index.html');
}

const files = readdirSync(outputDirectory, {
  recursive: true,
  withFileTypes: true,
})
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name));

const bundleFiles = files.filter((file) =>
  ['.css', '.html', '.js'].includes(extname(file)),
);
const sourceMaps = files.filter((file) => extname(file) === '.map');

if (sourceMaps.length > 0) {
  throw new Error(`Production source maps found: ${sourceMaps.join(', ')}`);
}

if (!bundleFiles.some((file) => extname(file) === '.js')) {
  throw new Error('Build output contains no JavaScript bundle');
}

for (const file of bundleFiles) {
  const contents = readFileSync(file, 'utf8');

  if (contents.includes('data:font')) {
    throw new Error(`Base64 font found in ${file}`);
  }

  for (const forbiddenString of forbiddenStrings) {
    if (contents.includes(forbiddenString)) {
      throw new Error(
        `Prototype tooling string found in ${file}: ${forbiddenString}`,
      );
    }
  }
}

const oversizedScripts = bundleFiles.filter(
  (file) => extname(file) === '.js' && statSync(file).size > 500 * 1024,
);

if (oversizedScripts.length > 0) {
  throw new Error(
    `JavaScript chunks exceed 500 KiB: ${oversizedScripts.map((file) => basename(file)).join(', ')}`,
  );
}

const xlsxChunks = bundleFiles.filter(
  (file) => extname(file) === '.js' && basename(file).startsWith('xlsx-'),
);

if (xlsxChunks.length !== 1) {
  throw new Error(`Expected one lazy SheetJS chunk, found ${xlsxChunks.length}`);
}

const indexHtml = readFileSync(indexPath, 'utf8');
const initialScripts = [...indexHtml.matchAll(/<script[^>]+src="([^"]+\.js)"/g)]
  .map((match) => match[1])
  .filter(Boolean);

if (initialScripts.some((source) => source?.includes('/xlsx-'))) {
  throw new Error('SheetJS is eagerly referenced by dist/index.html');
}

const initialScriptContents = initialScripts
  .map((source) => source?.split('/').at(-1))
  .filter(Boolean)
  .map((file) => readFileSync(join(outputDirectory, 'assets', file), 'utf8'))
  .join('\n');

for (const marker of [
  'analytics-overview',
  'budget-chart-bars',
  'gantt-chart',
  'task-dashboard',
]) {
  if (initialScriptContents.includes(marker)) {
    throw new Error(`Chart marker found in initial scripts: ${marker}`);
  }
}

const xlsxContents = readFileSync(xlsxChunks[0], 'utf8');
if (!xlsxContents.includes('SheetJS')) {
  throw new Error('The lazy xlsx chunk does not contain the expected SheetJS code');
}

console.log(
  `Bundle check passed (${bundleFiles.length} files inspected; no source maps or >500 KiB scripts; SheetJS and charts are lazy).`,
);
