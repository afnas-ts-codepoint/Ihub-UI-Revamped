import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const outputDirectory = 'dist';
const forbiddenStrings = [
  '__activate_edit_mode',
  '__deactivate_edit_mode',
  '__ihubShowErr',
  '?ihubPreview',
];

if (!existsSync(join(outputDirectory, 'index.html'))) {
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

if (!bundleFiles.some((file) => extname(file) === '.js')) {
  throw new Error('Build output contains no JavaScript bundle');
}

for (const file of bundleFiles) {
  const contents = readFileSync(file, 'utf8');

  for (const forbiddenString of forbiddenStrings) {
    if (contents.includes(forbiddenString)) {
      throw new Error(
        `Prototype tooling string found in ${file}: ${forbiddenString}`,
      );
    }
  }
}

console.log(`Bundle check passed (${bundleFiles.length} files inspected).`);
