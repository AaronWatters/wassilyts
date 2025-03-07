import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npx serve .', // Serve the whole repo
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  testDir: './test/e2e',
  use: {
    headless: true,
  },
});
