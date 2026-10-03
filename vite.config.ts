import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

import { viteBasePath } from './src/shared/config/basePath.ts';

export default defineConfig(({ mode }) => {
  const buildEnvironment = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    base: viteBasePath(buildEnvironment.VITE_BASE_PATH),
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            minSize: 10_000,
            groups: [
              {
                name: 'vendor-react',
                test: /node_modules[\\/](?:react|react-dom|react-router|scheduler)[\\/]/,
              },
              {
                name: 'vendor-ui',
                test: /node_modules[\\/](?:@radix-ui|radix-ui|vaul|lucide-react|react-remove-scroll|@floating-ui)[\\/]/,
              },
              {
                name: 'vendor-forms',
                test: /node_modules[\\/](?:@hookform|react-hook-form|yup)[\\/]/,
              },
              {
                name: 'vendor-state-i18n',
                test: /node_modules[\\/](?:zustand|i18next|react-i18next)[\\/]/,
              },
              {
                maxSize: 400_000,
                name: 'shared-foundation',
                test: /[\\/]src[\\/]shared[\\/]/,
              },
            ],
          },
        },
      },
      sourcemap: false,
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      environment: 'jsdom',
      exclude: ['tests/visual/**', 'node_modules/**', 'dist/**'],
      fileParallelism: false,
      setupFiles: ['./src/test/setup.ts'],
      testTimeout: 20_000,
    },
  };
});
