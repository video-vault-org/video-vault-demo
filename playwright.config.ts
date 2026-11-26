import { defineConfig } from '@playwright/test';

const config = defineConfig({
  testDir: 'e2e',
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:4321',
    headless: true,
    launchOptions: {
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}),
      args: ['--no-sandbox']
    }
  },
  webServer: { command: 'npm run build && npm run preview -- --port 4321 --strictPort', url: 'http://127.0.0.1:4321', reuseExistingServer: false, timeout: 60000 }
});

export default config;
