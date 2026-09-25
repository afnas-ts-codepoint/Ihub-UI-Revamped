import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const deepFeatureImport = {
  regex: '^@/features/[^/]+/.+',
  message: 'Import features through their root public API.',
};

const appImport = {
  regex: '^@/app(?:/|$)',
  message: 'Only the composition root may depend on app modules.',
};

const restrictedImports = (...patterns) => [
  'error',
  { patterns: [deepFeatureImport, ...patterns] },
];

const featureImport = (allowed) => ({
  regex: `^@/features/(?!(?:${allowed.join('|')})$)[^/]+$`,
  message: 'This feature dependency is not allowed by the architecture.',
});

const jsxRestrictions = [
  'error',
  {
    selector: 'JSXText[value=/\\S/]',
    message: 'Move JSX text literals to the owning i18n namespace.',
  },
  {
    selector:
      "JSXAttribute[name.name='className'] Literal[value=/(^|\\s)(?:p[lr]|m[lr]|left|right|text-left|text-right|border-[lr])-/]",
    message: 'Use logical, RTL-safe direction utilities.',
  },
  {
    selector:
      "JSXAttribute[name.name='className'] Literal[value=/(?:^|\\s|:)(?:bg|text|border|ring|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}/]",
    message:
      'Use approved semantic color tokens instead of the default palette.',
  },
];

export default tseslint.config(
  {
    ignores: ['coverage/**', 'dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-imports': restrictedImports(),
      'no-restricted-syntax': jsxRestrictions,
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports(
        {
          regex: '^@/features(?:/|$)',
          message: 'Shared modules may not import features.',
        },
        {
          regex: '^@/store(?:/|$)',
          message: 'Shared modules may not import the application store.',
        },
        appImport,
      ),
    },
  },
  {
    files: ['src/store/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports(
        {
          regex: '^@/features(?:/|$)',
          message: 'The application store may not import features.',
        },
        appImport,
      ),
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports(
        appImport,
        featureImport(['organization']),
      ),
    },
  },
  {
    files: ['src/features/home/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports(
        appImport,
        featureImport(['tasks', 'sla', 'payment-settlement', 'organization']),
      ),
    },
  },
  {
    files: ['src/features/incidents/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports(
        appImport,
        featureImport(['tasks', 'organization']),
      ),
    },
  },
  {
    files: ['src/features/settings/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports(
        appImport,
        featureImport(['tasks', 'home', 'organization']),
      ),
    },
  },
  {
    files: ['src/features/organization/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports(appImport, {
        regex: '^@/features(?:/|$)',
        message: 'Organization is a leaf feature and may not import features.',
      }),
    },
  },
);
