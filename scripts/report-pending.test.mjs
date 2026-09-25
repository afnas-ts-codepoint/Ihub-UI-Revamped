import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

const temporaryDirectories = [];
const script = resolve('scripts/report-pending.mjs');

function createFixture(source) {
  const directory = mkdtempSync(join(tmpdir(), 'ihub-pending-'));
  const sourceDirectory = join(directory, 'src');
  mkdirSync(sourceDirectory);
  writeFileSync(join(sourceDirectory, 'Fixture.tsx'), source, 'utf8');
  temporaryDirectories.push(directory);
  return sourceDirectory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe('report-pending', () => {
  it('passes release mode with zero markers', () => {
    const sourceDirectory = createFixture('export const ready = true;');
    const output = execFileSync(
      process.execPath,
      [script, '--root', sourceDirectory, '--release'],
      { encoding: 'utf8' },
    );

    expect(output).toContain('MigrationPending markers: 0');
  });

  it('lists markers and fails release mode while one exists', () => {
    const sourceDirectory = createFixture(
      'export const fixture = <MigrationPending area="Example" />;',
    );
    const result = spawnSync(
      process.execPath,
      [script, '--root', sourceDirectory, '--release'],
      { encoding: 'utf8' },
    );

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('MigrationPending markers: 1');
    expect(result.stdout).toContain('Fixture.tsx:1');
  });
});
