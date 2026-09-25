import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { compile } from 'tailwindcss';
import { afterEach, describe, expect, it } from 'vitest';

import {
  inkTokenFixture,
  invariantTokenFixture,
  paperTokenFixture,
  type TokenFixture,
} from '@/styles/tokens.fixture';

const stylesDirectory = resolve(process.cwd(), 'src/styles');
const baseCss = readFileSync(resolve(stylesDirectory, 'base.css'), 'utf8');
const fontsCss = readFileSync(resolve(stylesDirectory, 'fonts.css'), 'utf8');
const indexCss = readFileSync(resolve(stylesDirectory, 'index.css'), 'utf8');
const tokensCss = readFileSync(resolve(stylesDirectory, 'tokens.css'), 'utf8');

function declarationsIn(css: string, selector: string) {
  const selectorIndex = css.indexOf(selector);
  const openingBrace = css.indexOf('{', selectorIndex);
  const closingBrace = css.indexOf('}', openingBrace);

  if (selectorIndex === -1 || openingBrace === -1 || closingBrace === -1) {
    throw new Error(`Missing CSS block: ${selector}`);
  }

  const declarations = new Map<string, string>();

  for (const match of css
    .slice(openingBrace + 1, closingBrace)
    .matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    const name = match[1];
    const value = match[2];

    if (name && value) {
      declarations.set(name, value.trim());
    }
  }

  return declarations;
}

function expectFixture(
  declarations: ReadonlyMap<string, string>,
  fixture: readonly TokenFixture[],
) {
  for (const token of fixture) {
    const value = declarations.get(token.name)?.replace(/\s+/g, ' ');
    const expected = token.value.replace(/\s+/g, ' ');

    expect(
      value,
      `${token.name} from index.html:${String(token.sourceLine)}`,
    ).toBe(expected);
  }
}

function baseCssForDom() {
  return baseCss.replace(/@utility[\s\S]*?\n}\n/g, '');
}

afterEach(() => {
  document.head.querySelector('[data-test-styles]')?.remove();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('dir');
});

describe('design tokens', () => {
  it('matches every approved prototype token fixture', () => {
    expectFixture(declarationsIn(tokensCss, ':root {'), paperTokenFixture);
    expectFixture(
      declarationsIn(indexCss, '@theme static {'),
      invariantTokenFixture,
    );
    expectFixture(
      declarationsIn(tokensCss, ":root[data-theme='ink']"),
      inkTokenFixture,
    );
  });

  it('switches token values when the root uses the Ink theme', () => {
    const style = document.createElement('style');
    style.dataset.testStyles = '';
    style.textContent = tokensCss;
    document.head.append(style);

    const paperStyle = getComputedStyle(document.documentElement);
    expect(paperStyle.getPropertyValue('--bg').trim()).toBe('#ECECF0');

    document.documentElement.dataset.theme = 'ink';

    const inkStyle = getComputedStyle(document.documentElement);
    for (const token of inkTokenFixture) {
      expect(inkStyle.getPropertyValue(token.name).replace(/\s+/g, '')).toBe(
        token.value.replace(/\s+/g, ''),
      );
    }
  });

  it('applies the Arabic font stack and RTL line height from the root direction', () => {
    const style = document.createElement('style');
    style.dataset.testStyles = '';
    style.textContent = `:root { --font-ui: 'Test UI'; --font-arabic: 'Test Arabic'; }\n${baseCssForDom()}`;
    document.head.append(style);

    const ltrStyle = getComputedStyle(document.body);
    expect(ltrStyle.fontFamily).toBe('var(--font-ui)');
    expect(ltrStyle.lineHeight).toBe('1.5');
    document.documentElement.dir = 'rtl';

    const rtlStyle = getComputedStyle(document.body);
    expect(rtlStyle.fontFamily).toBe('var(--font-arabic)');
    expect(rtlStyle.lineHeight).toBe('1.58');
  });

  it('does not compile the default palette but compiles semantic colors', async () => {
    const themeBlocks = indexCss.match(/@theme[^{]*\{[^}]+}/g);

    if (!themeBlocks) {
      throw new Error('Missing Tailwind theme blocks');
    }

    const compiler = await compile(
      `@tailwind utilities;\n${themeBlocks.join('\n')}`,
    );
    const output = compiler.build(['bg-red-500', 'bg-canvas']);

    expect(output).not.toContain('.bg-red-500');
    expect(output).toContain('.bg-canvas');
  });

  it('keeps fidelity-critical chip tones in sRGB', async () => {
    const compiler = await compile(`@tailwind utilities;\n${baseCss}`);
    const output = compiler.build(['chip-tone-ok', 'chip-tone-accent']);

    expect(output).toContain('color-mix(in srgb, var(--ok) 14%, transparent)');
    expect(output).toContain(
      'color-mix(in srgb, var(--accent) 32%, transparent)',
    );
  });

  it('contains no embedded font data', () => {
    expect(indexCss).not.toContain('data:font');
    expect(baseCss).not.toContain('data:font');
    expect(fontsCss).not.toContain('data:font');
    expect(tokensCss).not.toContain('data:font');
  });
});
