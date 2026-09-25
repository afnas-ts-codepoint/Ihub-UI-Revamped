import { defineConfig } from '@playwright/test';

export default defineConfig({
  expect: { timeout: 10_000 },
  fullyParallel: false,
  outputDir: 'test-results/playwright',
  reporter: [['list']],
  testDir: './tests/visual',
  timeout: 60_000,
  use: {
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command:
        'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173',
      port: 4173,
      reuseExistingServer: true,
    },
    {
      command: 'node scripts/prototype-serve.mjs',
      env: { PROTOTYPE_DIR: process.env.PROTOTYPE_DIR ?? '' },
      port: 4174,
      reuseExistingServer: true,
    },
  ],
});
