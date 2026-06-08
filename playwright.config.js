/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: 'tests/playwright',
  timeout: 30 * 1000,
  use: {
    headless: true,
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    viewport: { width: 1280, height: 800 },
    actionTimeout: 5000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
};
module.exports = config;
