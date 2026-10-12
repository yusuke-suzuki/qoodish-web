import { env } from 'cloudflare:test';
import { expect } from 'vitest';
import { createApp } from '../app.ts';
import { createSigner, firebaseClaims } from './jwt.ts';

export type Caller = string | Record<string, unknown>;

const signer = createSigner();
const app = signer.then(({ keys }) => createApp({ firebaseKeys: keys }));

export async function send(
  method: string,
  path: string,
  caller?: Caller,
  body?: unknown,
  language?: string
) {
  const headers = new Headers();

  if (caller !== undefined) {
    const claims = typeof caller === 'string' ? { sub: caller } : caller;
    const token = await (await signer).sign(
      firebaseClaims(env.GOOGLE_PROJECT_ID, claims)
    );

    headers.set('authorization', `Bearer ${token}`);
  }

  if (body !== undefined) {
    headers.set('content-type', 'application/json');
  }

  if (language) {
    headers.set('accept-language', language);
  }

  const res = await (await app).request(
    path,
    {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    },
    env
  );
  const text = await res.text();

  return { status: res.status, body: text ? JSON.parse(text) : null };
}

export function get(path: string, caller?: Caller, language?: string) {
  return send('GET', path, caller, undefined, language);
}

export async function idsOf(path: string, caller?: Caller): Promise<number[]> {
  const { status, body } = await get(path, caller);
  const list: { id: number }[] = Array.isArray(body) ? body : body.data;

  expect(status).toBe(200);
  return list.map((item) => item.id);
}
