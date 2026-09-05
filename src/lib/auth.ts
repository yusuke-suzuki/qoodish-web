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

type ServerAuthState = {
  authenticated: boolean;
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

  if (!idToken) {
    return { authenticated: false };
  }

  const uid = await resolveUid(idToken);

  if (uid) {
    return { authenticated: true, uid, token: idToken };
  }

  return { authenticated: false };
});
