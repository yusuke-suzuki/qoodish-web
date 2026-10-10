import {
  createKeysFetcher,
  type JwtPayload,
  type KeysFetcher,
  verifyRs256Jwt
} from './jwt.ts';

export const FIREBASE_KEYS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

export type FirebaseIdToken = JwtPayload & {
  sub: string;
  name?: string;
  email?: string;
};

const fetchFirebaseKeys = createKeysFetcher(FIREBASE_KEYS_URL);

export async function verifyFirebaseIdToken(
  token: string,
  projectId: string,
  fetchKeys: KeysFetcher = fetchFirebaseKeys,
  now: number = Date.now()
): Promise<FirebaseIdToken | null> {
  const payload = await verifyRs256Jwt(
    token,
    {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId
    },
    fetchKeys,
    now
  );

  return payload as FirebaseIdToken | null;
}

export function bearerToken(
  authorization: string | undefined
): string | undefined {
  const token = authorization?.split(' ', 2)[1];

  return token || undefined;
}
