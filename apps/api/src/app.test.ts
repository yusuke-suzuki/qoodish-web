import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.ts';
import { ApiError } from './errors.ts';
import { createSigner, firebaseClaims, type Signer } from './test/jwt.ts';

let signer: Signer;

beforeAll(async () => {
  signer = await createSigner();
});

function appWithProbes() {
  const app = createApp({ firebaseKeys: signer.keys });

  app.get('/guest/probe', (c) => c.json({ locale: c.get('language') }));
  app.get('/me/probe', (c) => c.json({ uid: c.get('idToken').sub }));
  app.get('/guest/boom', () => {
    throw new Error('unexpected');
  });
  app.get('/guest/conflict', () => {
    throw new ApiError('Conflict');
  });

  return app;
}

function request(path: string, init: RequestInit = {}) {
  return appWithProbes().request(path, init, env);
}

async function signedRequest(path: string, headers: HeadersInit = {}) {
  const token = await signer.sign(firebaseClaims(env.GOOGLE_PROJECT_ID));

  return request(path, {
    headers: { authorization: `Bearer ${token}`, ...headers }
  });
}

describe('healthcheck', () => {
  it('answers ok at /healthcheck and /', async () => {
    expect(await (await request('/healthcheck')).text()).toBe('ok');
    expect(await (await request('/')).text()).toBe('ok');
  });
});

describe('locale', () => {
  it('defaults to en', async () => {
    expect(await (await request('/guest/probe')).json()).toEqual({
      locale: 'en'
    });
  });

  it('picks the preferred supported language of Accept-Language', async () => {
    const res = await request('/guest/probe', {
      headers: { 'accept-language': 'ja-JP,ja;q=0.9,en;q=0.8' }
    });

    expect(await res.json()).toEqual({ locale: 'ja' });
  });

  it('falls back to en for an unsupported language', async () => {
    const res = await request('/guest/probe', {
      headers: { 'accept-language': 'fr-FR' }
    });

    expect(await res.json()).toEqual({ locale: 'en' });
  });
});

describe('authentication', () => {
  it('resolves the Firebase subject from a valid bearer token', async () => {
    const res = await signedRequest('/me/probe');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ uid: 'firebase-uid' });
  });

  it('answers 401 in the viewer locale without a token', async () => {
    const res = await request('/me/probe', {
      headers: { 'accept-language': 'ja' }
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      title: 'Unauthorized',
      detail: '認証エラーが発生しました。'
    });
  });

  it('answers 401 for an invalid token', async () => {
    const res = await request('/me/probe', {
      headers: { authorization: 'Bearer invalid' }
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      title: 'Unauthorized',
      detail: 'Authentication has failed.'
    });
  });

  it('leaves guest routes open', async () => {
    expect((await request('/guest/probe')).status).toBe(200);
  });
});

describe('errors', () => {
  it('answers 404 JSON for an unknown route', async () => {
    const res = await request('/guest/nowhere');

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      title: 'NotFound',
      detail: "No route matches [GET] '/guest/nowhere'"
    });
  });

  it('renders a thrown ApiError with its status and message', async () => {
    const res = await request('/guest/conflict', {
      headers: { 'accept-language': 'ja' }
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      title: 'Conflict',
      detail: 'リクエストの内容が競合しています。'
    });
  });

  it('hides unexpected errors behind a localized 500', async () => {
    const res = await request('/guest/boom', {
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
