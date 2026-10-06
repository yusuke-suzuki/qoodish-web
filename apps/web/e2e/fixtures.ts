import { test as base, expect } from '@playwright/test';

const ERROR_REPORT_PATH = '/api/errors';

export const test = base.extend<{
  pageErrors: string[];
  errorReports: string[];
}>({
  // The outage this suite exists for threw during the first render and left an
  // error page behind, which a check for the page shell would have passed.
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];

      page.on('pageerror', (error) => errors.push(error.message));

      await use(errors);

      expect(errors, 'the page threw while loading').toEqual([]);
    },
    { auto: true }
  ],
  // A Server Component that throws inside a Suspense boundary still answers
  // 200 and lands in error.tsx, so neither the status nor pageerror sees it.
  errorReports: [
    async ({ page }, use) => {
      const reports: string[] = [];

      page.on('request', (request) => {
        if (
          request.method() === 'POST' &&
          new URL(request.url()).pathname === ERROR_REPORT_PATH
        ) {
          reports.push(request.postData() ?? '');
        }
      });

      await use(reports);

      await expect(
        page.locator('.MuiAlert-standardError'),
        'the page rendered an error boundary'
      ).toHaveCount(0);

      expect(
        reports,
        `the page reported an error to ${ERROR_REPORT_PATH}`
      ).toEqual([]);
    },
    { auto: true }
  ]
});

export { expect };
