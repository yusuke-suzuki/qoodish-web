import { test as base, expect } from '@playwright/test';

export const test = base.extend<{ pageErrors: string[] }>({
  // The outage this suite exists for threw during the first render and left an
  // error page behind, which a check for the page shell would have passed. The
  // watch is automatic so a new spec cannot forget to ask for it.
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];

      page.on('pageerror', (error) => errors.push(error.message));

      await use(errors);

      expect(errors, 'the page threw while loading').toEqual([]);
    },
    { auto: true }
  ]
});

export { expect };
