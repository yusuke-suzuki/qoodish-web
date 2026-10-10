import type { KeysFetcher, SigningKey } from '../auth/jwt.ts';

const ALGORITHM = {
  name: 'RSASSA-PKCS1-v1_5',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256'
} as const;

export type Signer = {
  kid: string;
  publicJwk: SigningKey;
  sign(
    payload: object,
    header?: { alg?: string; kid?: string }
  ): Promise<string>;
  fetchKeys: KeysFetcher;
};

function encode(value: object | Uint8Array): string {
  const bytes =
    value instanceof Uint8Array
      ? value
      : new TextEncoder().encode(JSON.stringify(value));

  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function createSigner(kid = 'key-1'): Promise<Signer> {
  const pair = (await crypto.subtle.generateKey(ALGORITHM, true, [
    'sign',
    'verify'
  ])) as CryptoKeyPair;
  const exported = (await crypto.subtle.exportKey(
    'jwk',
    pair.publicKey
  )) as JsonWebKey;
  const publicJwk: SigningKey = { ...exported, kid };

  return {
    kid,
    publicJwk,
    async sign(payload, header = {}) {
      const unsigned = `${encode({ alg: 'RS256', kid, ...header })}.${encode(payload)}`;
      const signature = await crypto.subtle.sign(
        ALGORITHM.name,
        pair.privateKey,
        new TextEncoder().encode(unsigned)
      );

      return `${unsigned}.${encode(new Uint8Array(signature))}`;
    },
    fetchKeys: async () => [publicJwk]
  };
}

export function firebaseClaims(projectId: string, overrides: object = {}) {
  const nowSeconds = Math.floor(Date.now() / 1000);

  return {
    iss: `https://securetoken.google.com/${projectId}`,
    aud: projectId,
    sub: 'firebase-uid',
    iat: nowSeconds - 60,
    exp: nowSeconds + 3600,
    name: 'Alice',
    email: 'alice@example.com',
    ...overrides
  };
}
