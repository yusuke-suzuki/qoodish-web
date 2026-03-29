import { initializeServerApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { cookies } from 'next/headers';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

type ServerAuthState = {
  authenticated: boolean;
  uid?: string;
};

export async function getServerAuthState(): Promise<ServerAuthState> {
  const cookieStore = await cookies();
  const idToken = cookieStore.get('__session')?.value;

  if (!idToken) {
    return { authenticated: false };
  }

  try {
    const serverApp = initializeServerApp(firebaseConfig, {
      authIdToken: idToken
    });
    const auth = getAuth(serverApp);
    await auth.authStateReady();
    const user = auth.currentUser;

    if (user) {
      return { authenticated: true, uid: user.uid };
    }

    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}
