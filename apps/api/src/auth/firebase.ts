import { createRemoteJWKSet, type JWTVerifyGetKey, jwtVerify } from 'jose';

export const FIREBASE_KEYS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

export type FirebaseIdToken = {
  sub: string;
  name?: string;
  email?: string;
  [claim: string]: unknown;
};

const firebaseKeys = createRemoteJWKSet(new URL(FIREBASE_KEYS_URL));

export async function verifyFirebaseIdToken(
  token: string,
  projectId: string,
  keys: JWTVerifyGetKey = firebaseKeys
): Promise<FirebaseIdToken | null> {
  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ['RS256']
    });

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      return null;
    }

    return payload as FirebaseIdToken;
  } catch (error) {
    console.warn(`Firebase ID token rejected: ${String(error)}`);
    return null;
  }
}

export function bearerToken(
  authorization: string | undefined
): string | undefined {
  const token = authorization?.split(' ', 2)[1];

  return token || undefined;
}
