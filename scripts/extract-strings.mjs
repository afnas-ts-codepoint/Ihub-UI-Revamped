import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pairPattern =
  /\bT\(\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")\s*,\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")\s*,/g;

function decodeLiteral(literal) {
  return literal
    .slice(1, -1)
    .replace(/\\(['"\\])/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t');
}

export function extractTranslationPairs(source, startLine, endLine) {
  const selected = source
    .split(/\r?\n/)
    .slice(startLine - 1, endLine)
    .join('\n');
  const en = {};
  const ar = {};
  let match;
  let item = 0;

  while ((match = pairPattern.exec(selected)) !== null) {
    const english = match[1];
    const arabic = match[2];

    if (!english || !arabic) {
      continue;
    }

    const line =
      startLine + selected.slice(0, match.index).split('\n').length - 1;
    const key = `line${line}Item${++item}`;
    en[key] = decodeLiteral(english);
    ar[key] = decodeLiteral(arabic);
  }

  return { ar: { draft: ar }, en: { draft: en } };
}

export function writeDraftResources(
  sourcePath,
  startLine,
  endLine,
  namespace,
  outputDirectory,
) {
  const resources = extractTranslationPairs(
    readFileSync(sourcePath, 'utf8'),
    startLine,
    endLine,
  );

  for (const locale of ['en', 'ar']) {
    const outputPath = join(outputDirectory, locale, `${namespace}.json`);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(
      outputPath,
      `${JSON.stringify(resources[locale], null, 2)}\n`,
      'utf8',
    );
  }
}

const [, scriptPath, sourcePath, start, end, namespace, outputDirectory] =
  process.argv;

if (scriptPath && resolve(scriptPath) === fileURLToPath(import.meta.url)) {
  if (!sourcePath || !start || !end || !namespace || !outputDirectory) {
    throw new Error(
      'Usage: npm run extract:strings -- <source> <start> <end> <namespace> <output-directory>',
    );
  }

  writeDraftResources(
    resolve(sourcePath),
    Number(start),
    Number(end),
    namespace,
    resolve(outputDirectory),
  );
}
