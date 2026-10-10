import { beforeAll, describe, expect, it } from 'vitest';
import { DEVELOPMENT } from '../../environments.ts';
import { createSigner, firebaseClaims, type Signer } from '../test/jwt.ts';
import { verifyFirebaseIdToken } from './firebase.ts';

const PROJECT_ID = DEVELOPMENT.googleProjectId;

let signer: Signer;
let other: Signer;

beforeAll(async () => {
  signer = await createSigner('key-1');
  other = await createSigner('key-2');
});

describe('verifyFirebaseIdToken', () => {
  it('returns the payload of a token signed by a published key', async () => {
    const token = await signer.sign(firebaseClaims(PROJECT_ID));

    const payload = await verifyFirebaseIdToken(token, PROJECT_ID, signer.keys);

    expect(payload?.sub).toBe('firebase-uid');
    expect(payload?.email).toBe('alice@example.com');
  });

  it('rejects a token signed by an unknown key', async () => {
    const token = await other.sign(firebaseClaims(PROJECT_ID));

    expect(
      await verifyFirebaseIdToken(token, PROJECT_ID, signer.keys)
    ).toBeNull();
  });

  it('rejects a token issued for another project', async () => {
    const token = await signer.sign(firebaseClaims('another-project'));

    expect(
      await verifyFirebaseIdToken(token, PROJECT_ID, signer.keys)
    ).toBeNull();
  });

  it('rejects an expired token', async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = await signer.sign(
      firebaseClaims(PROJECT_ID, { exp: nowSeconds - 1 })
    );

    expect(
      await verifyFirebaseIdToken(token, PROJECT_ID, signer.keys)
    ).toBeNull();
  });

  it('rejects a token without a subject', async () => {
    const token = await signer.sign(firebaseClaims(PROJECT_ID, { sub: '' }));

    expect(
      await verifyFirebaseIdToken(token, PROJECT_ID, signer.keys)
    ).toBeNull();
  });

  it('rejects an unsigned token', async () => {
    const token = signer.signUnsigned(firebaseClaims(PROJECT_ID));

    expect(
      await verifyFirebaseIdToken(token, PROJECT_ID, signer.keys)
    ).toBeNull();
  });

  it('rejects a malformed token', async () => {
    expect(
      await verifyFirebaseIdToken('not.a.jwt.at.all', PROJECT_ID, signer.keys)
    ).toBeNull();
  });
});
