import type { APIRequestContext } from '@playwright/test';
import { expect, test } from './fixtures.ts';

const LOCALES = ['ja', 'en'] as const;

// The in-app proxy only exposes what the browser needs, so the rest of the
// guest API is read at its own origin.
const API_BASE_URL = process.env.E2E_API_URL ?? 'https://api-dev.qoodish.com';

const PUBLIC_PATHS = [
  '',
  '/discover',
  '/reports',
  '/chapters',
  '/terms',
  '/privacy'
];

type GuestMap = { id: number; private: boolean };

type GuestReview = {
  id: number;
  map: GuestMap;
  author: { id: number };
};

type GuestChapter = { id: number };

async function fetchGuestList<T>(
  request: APIRequestContext,
  path: string,
  what: string
): Promise<T[]> {
  const res = await request.get(path);
  const body = await res.text();

  expect(
    res.ok(),
    `${what} answered ${res.status()}: ${body.slice(0, 300)}`
  ).toBe(true);

  return JSON.parse(body) as T[];
}

async function firstMapId(request: APIRequestContext): Promise<string> {
  const configured = process.env.E2E_MAP_ID;

  if (configured) {
    return configured;
  }

  // Asking without a filter is not an option: the API reads a missing search
  // term as an invalid parameter rather than as no filter at all.
  const maps = await fetchGuestList<GuestMap>(
    request,
    '/api/v1/guest/maps?active=true',
    'guest map search'
  );

  // The listing carries private maps too, and their detail page answers 404 to
  // a reader who is not signed in.
  const publicMaps = maps.filter((map) => !map.private);

  expect(
    publicMaps.length,
    'the API needs at least one public map to smoke test'
  ).toBeGreaterThan(0);

  return String(publicMaps[0].id);
}

async function firstPublicReview(
  request: APIRequestContext
): Promise<GuestReview> {
  const reviews = await fetchGuestList<GuestReview>(
    request,
    `${API_BASE_URL}/guest/reviews?recent=true`,
    'guest recent pins'
  );

  const publicReviews = reviews.filter((review) => !review.map.private);

  expect(
    publicReviews.length,
    'the API needs at least one pin on a public map to smoke test'
  ).toBeGreaterThan(0);

  return publicReviews[0];
}

async function firstChapterId(request: APIRequestContext): Promise<string> {
  const chapters = await fetchGuestList<GuestChapter>(
    request,
    `${API_BASE_URL}/guest/chapters`,
    'guest chapters'
  );

  expect(
    chapters.length,
    'the API needs at least one published chapter to smoke test'
  ).toBeGreaterThan(0);

  return String(chapters[0].id);
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

  test(`boots the pin detail page in ${lang}`, async ({ page, request }) => {
    const review = await firstPublicReview(request);
    const route = `/${lang}/maps/${review.map.id}/reports/${review.id}`;

    const response = await page.goto(route);

    expect(response?.status(), `${route} answered with an error`).toBe(200);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test(`boots the profile page in ${lang}`, async ({ page, request }) => {
    const review = await firstPublicReview(request);
    const route = `/${lang}/users/${review.author.id}`;

    const response = await page.goto(route);

    expect(response?.status(), `${route} answered with an error`).toBe(200);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test(`boots the chapter detail page in ${lang}`, async ({
    page,
    request
  }) => {
    const chapterId = await firstChapterId(request);
    const route = `/${lang}/chapters/${chapterId}`;

    const response = await page.goto(route);

    expect(response?.status(), `${route} answered with an error`).toBe(200);
    await expect(page.locator('body')).not.toBeEmpty();
  });
}
