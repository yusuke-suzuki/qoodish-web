import { type Browser, launch, type Page } from '@cloudflare/playwright';
import type { Env } from './index.ts';

export interface CheckResult {
  name: string;
  ok: boolean;
  error?: string;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function checkHealth(env: Env): Promise<void> {
  const res = await fetch(new URL('/api/health', env.TARGET_ORIGIN), {
    signal: AbortSignal.timeout(15000)
  });

  if (!res.ok) {
    throw new Error(`/api/health answered ${res.status}`);
  }

  const body = (await res.json()) as { status?: string; sha?: string };

  if (body.status !== 'ok') {
    throw new Error(`/api/health reported status ${body.status ?? 'none'}`);
  }

  if (!body.sha) {
    throw new Error('/api/health reported no deployment SHA');
  }
}

async function openPage(
  page: Page,
  url: string,
  assert: (page: Page) => Promise<void>
): Promise<void> {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));

  const response = await page.goto(url, {
    waitUntil: 'load',
    timeout: 30000
  });

  if (response?.status() !== 200) {
    throw new Error(`${url} answered ${response?.status() ?? 'nothing'}`);
  }

  await assert(page);

  // A render crash still answers 200 with an error page.
  if (errors.length > 0) {
    throw new Error(`the page threw while loading: ${errors.join('; ')}`);
  }
}

async function checkTopPage(browser: Browser, env: Env): Promise<void> {
  const page = await browser.newPage();

  try {
    await openPage(page, `${env.TARGET_ORIGIN}/ja`, async (openedPage) => {
      const text = await openedPage.locator('body').innerText();

      if (text.trim().length === 0) {
        throw new Error('the page rendered an empty body');
      }
    });
  } finally {
    await page.close();
  }
}

async function checkMapDetailPage(browser: Browser, env: Env): Promise<void> {
  // Asking without a filter is not an option: the API reads a missing search
  // term as an invalid parameter rather than as no filter at all.
  const res = await fetch(
    new URL('/api/v1/guest/maps?active=true', env.TARGET_ORIGIN),
    { signal: AbortSignal.timeout(15000) }
  );

  if (!res.ok) {
    throw new Error(`guest map search answered ${res.status}`);
  }

  const maps = (await res.json()) as { id: number; private: boolean }[];
  const mapId = maps.find((map) => !map.private)?.id;

  if (mapId === undefined) {
    throw new Error('the API returned no public map to check');
  }

  const page = await browser.newPage();

  try {
    await openPage(
      page,
      `${env.TARGET_ORIGIN}/ja/maps/${mapId}`,
      async (openedPage) => {
        // Google injects this class once the Map constructor has run, so it
        // stands for the whole chain: rendered, hydrated, effects ran, Maps
        // script loaded.
        await openedPage.locator('.gm-style').first().waitFor({
          state: 'visible',
          timeout: 45000
        });
      }
    );
  } finally {
    await page.close();
  }
}

export async function runChecks(env: Env): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  const run = async (
    name: string,
    check: () => Promise<void>
  ): Promise<void> => {
    try {
      await check();
      results.push({ name, ok: true });
    } catch (error) {
      results.push({ name, ok: false, error: describe(error) });
    }
  };

  await run('health endpoint', () => checkHealth(env));

  try {
    const browser = await launch(env.BROWSER);

    try {
      await run('top page', () => checkTopPage(browser, env));
      await run('map detail page', () => checkMapDetailPage(browser, env));
    } finally {
      await browser.close();
    }
  } catch (error) {
    results.push({
      name: 'browser session',
      ok: false,
      error: describe(error)
    });
  }

  return results;
}
