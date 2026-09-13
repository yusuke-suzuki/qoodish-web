import {
  deleteApp,
  type FirebaseServerApp,
  initializeServerApp
} from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { cookies } from 'next/headers';
import { cache } from 'react';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export const SIGNED_IN_COOKIE = 'signed_in';

type ServerAuthState = {
  authenticated: boolean;
  // The browser carries a session the server cannot read yet: the ID token has
  // expired and the client has not exchanged its refresh token. Rendering
  // anything addressed to a stranger would be wrong for the few hundred
  // milliseconds until it does.
  pending: boolean;
  uid?: string;
  token?: string;
};

async function resolveUid(idToken: string): Promise<string | null> {
  let serverApp: FirebaseServerApp;

  try {
    serverApp = initializeServerApp(firebaseConfig, {
      authIdToken: idToken
    });
  } catch {
    return null;
  }

  // Server apps stay registered until deleteApp drops their reference count
  // to zero, so skipping it pins one Auth instance per token for the life of
  // the isolate.
  try {
    const auth = getAuth(serverApp);
    await auth.authStateReady();

    return auth.currentUser?.uid ?? null;
  } catch {
    return null;
  } finally {
    await deleteApp(serverApp);
  }
}

export async function verifyIdToken(idToken: string): Promise<boolean> {
  return (await resolveUid(idToken)) !== null;
}

export const getServerAuthState = cache(async (): Promise<ServerAuthState> => {
  const cookieStore = await cookies();
  const idToken = cookieStore.get('__session')?.value;
  const pending = cookieStore.get(SIGNED_IN_COOKIE)?.value === '1';

  if (!idToken) {
    return { authenticated: false, pending };
  }

  const uid = await resolveUid(idToken);

  if (uid) {
    return { authenticated: true, pending: false, uid, token: idToken };
  }

  return { authenticated: false, pending };
});
