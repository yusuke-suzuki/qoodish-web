import { createRemoteJWKSet, type JWTVerifyGetKey, jwtVerify } from 'jose';

export const ACCESS_JWT_HEADER = 'cf-access-jwt-assertion';

export type AccessClaims = {
  email: string;
  [claim: string]: unknown;
};

const publishedKeySets = new Map<string, JWTVerifyGetKey>();

function publishedKeys(teamDomain: string): JWTVerifyGetKey {
  let keys = publishedKeySets.get(teamDomain);

  if (!keys) {
    keys = createRemoteJWKSet(
      new URL(`https://${teamDomain}/cdn-cgi/access/certs`)
    );
    publishedKeySets.set(teamDomain, keys);
  }

  return keys;
}

export async function verifyAccessAssertion(
  token: string,
  teamDomain: string,
  audience: string,
  keys: JWTVerifyGetKey = publishedKeys(teamDomain)
): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer: `https://${teamDomain}`,
      audience,
      algorithms: ['RS256'],
      requiredClaims: ['exp', 'iat', 'email']
    });

    if (typeof payload.email !== 'string' || payload.email.length === 0) {
      return null;
    }

    return payload as AccessClaims;
  } catch (error) {
    console.warn(`Access assertion rejected: ${String(error)}`);
    return null;
  }
}
