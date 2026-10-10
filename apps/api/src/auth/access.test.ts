import { beforeAll, describe, expect, it } from 'vitest';
import { CF_ACCESS_TEAM_DOMAIN, DEVELOPMENT } from '../../environments.ts';
import { accessClaims, createSigner, type Signer } from '../test/jwt.ts';
import { verifyAccessAssertion } from './access.ts';

const TEAM_DOMAIN = CF_ACCESS_TEAM_DOMAIN;
const AUDIENCE = DEVELOPMENT.accessAud;

let signer: Signer;
let other: Signer;

beforeAll(async () => {
  signer = await createSigner('access-1');
  other = await createSigner('access-2');
});

function verify(token: string) {
  return verifyAccessAssertion(token, TEAM_DOMAIN, AUDIENCE, signer.keys);
}

describe('verifyAccessAssertion', () => {
  it('returns the claims of an assertion signed by a published key', async () => {
    const token = await signer.sign(accessClaims(TEAM_DOMAIN, AUDIENCE));

    expect((await verify(token))?.email).toBe('staff@example.com');
  });

  it('rejects an assertion signed by an unknown key', async () => {
    const token = await other.sign(accessClaims(TEAM_DOMAIN, AUDIENCE));

    expect(await verify(token)).toBeNull();
  });

  it('rejects an assertion for another application', async () => {
    const token = await signer.sign(accessClaims(TEAM_DOMAIN, 'another-aud'));

    expect(await verify(token)).toBeNull();
  });

  it('rejects an assertion from another team', async () => {
    const token = await signer.sign(
      accessClaims('other.cloudflareaccess.com', AUDIENCE)
    );

    expect(await verify(token)).toBeNull();
  });

  it('rejects an expired assertion', async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = await signer.sign(
      accessClaims(TEAM_DOMAIN, AUDIENCE, { exp: nowSeconds - 1 })
    );

    expect(await verify(token)).toBeNull();
  });

  it('rejects an assertion that never expires', async () => {
    const { exp, ...claims } = accessClaims(TEAM_DOMAIN, AUDIENCE);
    const token = await signer.sign(claims);

    expect(exp).toBeDefined();
    expect(await verify(token)).toBeNull();
  });

  it('rejects an assertion without an email', async () => {
    const { email, ...claims } = accessClaims(TEAM_DOMAIN, AUDIENCE);
    const token = await signer.sign(claims);

    expect(email).toBeDefined();
    expect(await verify(token)).toBeNull();
  });

  it('rejects an unsigned assertion', async () => {
    const token = signer.signUnsigned(accessClaims(TEAM_DOMAIN, AUDIENCE));

    expect(await verify(token)).toBeNull();
  });
});
