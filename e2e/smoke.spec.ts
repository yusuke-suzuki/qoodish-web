import type { APIRequestContext } from '@playwright/test';
import { expect, test } from './fixtures.ts';

const LOCALES = ['ja', 'en'] as const;

const PUBLIC_PATHS = ['', '/discover', '/login', '/terms', '/privacy'];

async function firstMapId(request: APIRequestContext): Promise<string> {
  const configured = process.env.E2E_MAP_ID;

  if (configured) {
    return configured;
  }

  // Asking without a filter is not an option: the API reads a missing search
  // term as an invalid parameter rather than as no filter at all.
  const res = await request.get('/api/v1/guest/maps?active=true');

  const body = await res.text();

  expect(
    res.ok(),
    `guest map search answered ${res.status()}: ${body.slice(0, 300)}`
  ).toBe(true);

  const maps = JSON.parse(body) as { id: number; private: boolean }[];

  // The listing carries private maps too, and their detail page answers 404 to
  // a reader who is not signed in.
  const publicMaps = maps.filter((map) => !map.private);

  expect(
    publicMaps.length,
    'the API needs at least one public map to smoke test'
  ).toBeGreaterThan(0);

  return String(publicMaps[0].id);
}

for (const lang of LOCALES) {
  for (const path of PUBLIC_PATHS) {
    const route = `/${lang}${path}`;

    test(`boots ${route}`, async ({ page }) => {
      const response = await page.goto(route);

      expect(response?.status(), `${route} answered with an error`).toBe(200);
      await expect(page.locator('body')).not.toBeEmpty();
    });
  }
}

// The post-deploy workflow polls this route to learn which commit is live, so
// the PR run proves the contract before it ships.
test('answers the health check', async ({ request }) => {
  const res = await request.get('/api/health');

  expect(res.status(), '/api/health answered with an error').toBe(200);

  const body = (await res.json()) as { status: string; sha: string };

  expect(body.status).toBe('ok');
  expect(body.sha).not.toHaveLength(0);
});

for (const lang of LOCALES) {
  test(`boots the map detail page in ${lang}`, async ({ page, request }) => {
    const mapId = await firstMapId(request);
    const route = `/${lang}/maps/${mapId}`;

    const response = await page.goto(route);

    expect(response?.status(), `${route} answered with an error`).toBe(200);

    // Google injects this class once the Map constructor has run, so it stands
    // for the chain the outage broke: rendered, hydrated, effects ran, Maps
    // script loaded.
    await expect(page.locator('.gm-style').first()).toBeVisible({
      timeout: 30000
    });
  });
}
