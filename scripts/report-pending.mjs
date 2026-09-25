import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function sourceFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);

    if (statSync(path).isDirectory()) {
      return sourceFiles(path);
    }

    return extname(path) === '.tsx' && !/\.(?:test|spec)\.tsx$/.test(path)
      ? [path]
      : [];
  });
}

export function findPendingMarkers(directory) {
  const root = resolve(directory);

  return sourceFiles(root).flatMap((path) => {
    const source = readFileSync(path, 'utf8');
    const markers = [];

    for (const match of source.matchAll(/<MigrationPending(?:\s|\/|>)/g)) {
      markers.push({
        file: relative(process.cwd(), path),
        line: source.slice(0, match.index).split('\n').length,
      });
    }

    return markers;
  });
}

function readArguments(arguments_) {
  const rootIndex = arguments_.indexOf('--root');

  return {
    release: arguments_.includes('--release'),
    root:
      rootIndex >= 0 && arguments_[rootIndex + 1]
        ? arguments_[rootIndex + 1]
        : 'src',
  };
}

export function reportPending(arguments_) {
  const { release, root } = readArguments(arguments_);
  const markers = findPendingMarkers(root);

  if (markers.length === 0) {
    console.log('MigrationPending markers: 0');
  } else {
    console.log(`MigrationPending markers: ${String(markers.length)}`);

    for (const marker of markers) {
      console.log(`- ${marker.file}:${String(marker.line)}`);
    }
  }

  if (release && markers.length > 0) {
    process.exitCode = 1;
  }
}

const scriptPath = process.argv[1];

if (scriptPath && resolve(scriptPath) === fileURLToPath(import.meta.url)) {
  reportPending(process.argv.slice(2));
}
