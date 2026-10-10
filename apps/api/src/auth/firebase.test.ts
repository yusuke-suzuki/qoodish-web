import { beforeAll, describe, expect, it } from 'vitest';
import { createSigner, firebaseClaims, type Signer } from '../test/jwt.ts';
import { bearerToken, verifyFirebaseIdToken } from './firebase.ts';

const PROJECT_ID = 'qoodish-test';

let signer: Signer;
let other: Signer;

beforeAll(async () => {
  signer = await createSigner('key-1');
  other = await createSigner('key-2');
});

describe('verifyFirebaseIdToken', () => {
  it('returns the payload of a token signed by a published key', async () => {
    const token = await signer.sign(firebaseClaims(PROJECT_ID));

    const payload = await verifyFirebaseIdToken(
      token,
      PROJECT_ID,
      signer.fetchKeys
    );

    expect(payload?.sub).toBe('firebase-uid');
    expect(payload?.email).toBe('alice@example.com');
  });

  it('rejects a token signed by an unknown key', async () => {
    const token = await other.sign(firebaseClaims(PROJECT_ID));

    expect(
      await verifyFirebaseIdToken(token, PROJECT_ID, signer.fetchKeys)
    ).toBeNull();
  });

  it('rejects a token issued for another project', async () => {
    const token = await signer.sign(firebaseClaims('another-project'));

    expect(
      await verifyFirebaseIdToken(token, PROJECT_ID, signer.fetchKeys)
    ).toBeNull();
  });

  it('rejects an expired token', async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = await signer.sign(
      firebaseClaims(PROJECT_ID, { exp: nowSeconds - 1 })
    );

    expect(
      await verifyFirebaseIdToken(token, PROJECT_ID, signer.fetchKeys)
    ).toBeNull();
  });

  it('rejects a token without a subject', async () => {
    const token = await signer.sign(firebaseClaims(PROJECT_ID, { sub: '' }));

    expect(
      await verifyFirebaseIdToken(token, PROJECT_ID, signer.fetchKeys)
    ).toBeNull();
  });

  it('rejects an unsigned algorithm', async () => {
    const token = await signer.sign(firebaseClaims(PROJECT_ID), {
      alg: 'none'
    });

    expect(
      await verifyFirebaseIdToken(token, PROJECT_ID, signer.fetchKeys)
    ).toBeNull();
  });

  it('rejects a malformed token', async () => {
    expect(
      await verifyFirebaseIdToken(
        'not.a.jwt.at.all',
        PROJECT_ID,
        signer.fetchKeys
      )
    ).toBeNull();
  });
});

describe('bearerToken', () => {
  it('takes the token after the scheme', () => {
    expect(bearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('is undefined without a header or a token', () => {
    expect(bearerToken(undefined)).toBeUndefined();
    expect(bearerToken('Bearer')).toBeUndefined();
    expect(bearerToken('Bearer ')).toBeUndefined();
  });
});
