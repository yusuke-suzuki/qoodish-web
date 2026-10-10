import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp, currentIdToken } from './app.ts';
import { ApiError } from './errors.ts';
import { createSigner, firebaseClaims, type Signer } from './test/jwt.ts';

let signer: Signer;

beforeAll(async () => {
  signer = await createSigner();
});

function appWithProbe() {
  const app = createApp({
    fetchFirebaseKeys: (...args) => signer.fetchKeys(...args)
  });

  app.get('/probe', (c) =>
    c.json({ locale: c.get('locale'), uid: c.get('idToken')?.sub ?? null })
  );
  app.get('/me/probe', (c) => c.json({ uid: currentIdToken(c.var).sub }));
  app.get('/boom', () => {
    throw new Error('unexpected');
  });

  return app;
}

function request(path: string, init: RequestInit = {}) {
  return appWithProbe().request(path, init, env);
}

describe('healthcheck', () => {
  it('answers ok at /healthcheck and /', async () => {
    expect(await (await request('/healthcheck')).text()).toBe('ok');
    expect(await (await request('/')).text()).toBe('ok');
  });
});

describe('locale', () => {
  it('defaults to en', async () => {
    const body = await (await request('/probe')).json();

    expect(body).toMatchObject({ locale: 'en' });
  });

  it('reads the leading language of Accept-Language', async () => {
    const res = await request('/probe', {
      headers: { 'accept-language': 'ja-JP,ja;q=0.9,en;q=0.8' }
    });

    expect(await res.json()).toMatchObject({ locale: 'ja' });
  });

  it('falls back to en for an unsupported language', async () => {
    const res = await request('/probe', {
      headers: { 'accept-language': 'fr-FR' }
    });

    expect(await res.json()).toMatchObject({ locale: 'en' });
  });
});

describe('authentication', () => {
  it('resolves the Firebase subject from a valid bearer token', async () => {
    const token = await signer.sign(firebaseClaims(env.GOOGLE_PROJECT_ID));
    const res = await request('/probe', {
      headers: { authorization: `Bearer ${token}` }
    });

    expect(await res.json()).toMatchObject({ uid: 'firebase-uid' });
  });

  it('treats an invalid token as a guest', async () => {
    const res = await request('/probe', {
      headers: { authorization: 'Bearer invalid' }
    });

    expect(await res.json()).toMatchObject({ uid: null });
  });

  it('answers 401 in the viewer locale when a token is required', async () => {
    const res = await request('/me/probe', {
      headers: { 'accept-language': 'ja' }
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      title: 'Unauthorized',
      detail: '認証エラーが発生しました。'
    });
  });
});

describe('errors', () => {
  it('answers 404 JSON for an unknown route', async () => {
    const res = await request('/nowhere');

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      title: 'NotFound',
      detail: "No route matches [GET] '/nowhere'"
    });
  });

  it('hides unexpected errors behind a localized 500', async () => {
    const res = await request('/boom', {
      headers: { 'accept-language': 'ja' }
    });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      title: 'InternalServerError',
      detail: 'サーバー内部エラーが発生しました。'
    });
  });

  it('uses the default message of the status unless a detail is given', () => {
    expect(new ApiError('Conflict').body('en')).toEqual({
      title: 'Conflict',
      detail: 'A conflict has occurred for the requested resource.'
    });
    expect(
      new ApiError('UnprocessableContent', 'Map name is duplicated.').body('ja')
    ).toEqual({
      title: 'UnprocessableContent',
      detail: 'Map name is duplicated.'
    });
  });
});

describe('database', () => {
  it('has the migrated schema applied', async () => {
    const { results } = await env.DB.prepare(
      "SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'users'"
    ).all<{ name: string }>();

    expect(results.map((row) => row.name)).toEqual(['users']);
  });
});
