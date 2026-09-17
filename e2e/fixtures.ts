import { test as base, expect, type Request } from '@playwright/test';

const ERROR_REPORT_PATH = '/api/errors';

const SETTLE_TIMEOUT_MS = 10000;
const SETTLE_QUIET_MS = 1000;
const SETTLE_POLL_MS = 100;

export const test = base.extend<{
  pageErrors: string[];
  errorReports: string[];
  openRequests: Set<Request>;
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
  ],
  // Closing the browser on a request the app is still answering severs the
  // connection mid-response, and the worker reports that as an exception of
  // its own. A reader who leaves does the same thing, but a run that ends on
  // every deployment turns it into an alert per merge.
  openRequests: [
    async ({ page, baseURL }, use) => {
      const open = new Set<Request>();
      const appOrigin = baseURL ? new URL(baseURL).origin : undefined;
      // An emptied set is not the end of it: a prefetch the page schedules
      // after load opens the next request a moment later, and one that opens
      // and closes between two polls is never seen as open at all.
      let lastActivity = Date.now();

      page.on('request', (request) => {
        if (appOrigin && new URL(request.url()).origin === appOrigin) {
          open.add(request);
          lastActivity = Date.now();
        }
      });
      page.on('requestfinished', (request) => {
        if (open.delete(request)) {
          lastActivity = Date.now();
        }
      });
      page.on('requestfailed', (request) => {
        if (open.delete(request)) {
          lastActivity = Date.now();
        }
      });

      await use(open);

      const deadline = Date.now() + SETTLE_TIMEOUT_MS;

      while (!page.isClosed() && Date.now() < deadline) {
        if (open.size === 0 && Date.now() - lastActivity >= SETTLE_QUIET_MS) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, SETTLE_POLL_MS));
      }
    },
    { auto: true }
  ]
});

export { expect };
