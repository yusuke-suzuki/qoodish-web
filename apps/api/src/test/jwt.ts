import {
  base64url,
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  type JWTVerifyGetKey,
  SignJWT
} from 'jose';

export type Signer = {
  kid: string;
  keys: JWTVerifyGetKey;
  sign(payload: Record<string, unknown>): Promise<string>;
  signUnsigned(payload: Record<string, unknown>): string;
};

export async function createSigner(kid = 'key-1'): Promise<Signer> {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const jwk = { ...(await exportJWK(publicKey)), kid, alg: 'RS256' };
  const encode = (value: object) =>
    base64url.encode(new TextEncoder().encode(JSON.stringify(value)));

  return {
    kid,
    keys: createLocalJWKSet({ keys: [jwk] }),
    sign: (payload) =>
      new SignJWT(payload)
        .setProtectedHeader({ alg: 'RS256', kid })
        .sign(privateKey),
    signUnsigned: (payload) =>
      `${encode({ alg: 'none', kid })}.${encode(payload)}.`
  };
}

export function firebaseClaims(
  projectId: string,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
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
