import { defineConfig, devices } from '@playwright/test';

// A deployment is shared by every branch, so a run driving one can answer for
// a commit nobody put up for review. Serving the build here is what ties the
// answer to the commit under test.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:8787';

// A remote target means the post-deploy workflow, which uploads test-results
// as an artifact, so failures there keep their evidence.
const isRemoteTarget = !!process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL,
    // Nothing collects these from a PR run: it reports through its log.
    trace: process.env.CI && !isRemoteTarget ? 'off' : 'retain-on-failure',
    screenshot: process.env.CI && !isRemoteTarget ? 'off' : 'only-on-failure'
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm exec opennextjs-cloudflare preview --env dev',
        url: baseURL,
        timeout: 180000,
        reuseExistingServer: !process.env.CI
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] }
    }
  ]
});
