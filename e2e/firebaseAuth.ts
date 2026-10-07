import { API_BASE_URL } from './devApi.ts';

const IDENTITY_TOOLKIT = 'https://identitytoolkit.googleapis.com/v1';

export type FirebaseAdmin = { projectId: string; accessToken: string };

export function firebaseAdmin(): FirebaseAdmin | null {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const accessToken = process.env.E2E_FIREBASE_ACCESS_TOKEN;

  return projectId && accessToken ? { projectId, accessToken } : null;
}

async function identityToolkit<T>(
  url: string,
  body: object,
  accessToken?: string
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      `${new URL(url).pathname} answered ${res.status}: ${text.slice(0, 300)}`
    );
  }

  return JSON.parse(text) as T;
}

export async function emailSignInLink(
  admin: FirebaseAdmin,
  email: string,
  continueUrl: string
): Promise<URL> {
  const { oobLink } = await identityToolkit<{ oobLink: string }>(
    `${IDENTITY_TOOLKIT}/projects/${admin.projectId}/accounts:sendOobCode`,
    {
      requestType: 'EMAIL_SIGNIN',
      email,
      continueUrl,
      canHandleCodeInApp: true,
      returnOobLink: true
    },
    admin.accessToken
  );

  return new URL(oobLink);
}

export async function deleteTestAccount(
  admin: FirebaseAdmin,
  email: string,
  continueUrl: string
): Promise<void> {
  const link = await emailSignInLink(admin, email, continueUrl);
  const { idToken, localId } = await identityToolkit<{
    idToken: string;
    localId: string;
  }>(
    `${IDENTITY_TOOLKIT}/accounts:signInWithEmailLink?key=${link.searchParams.get('apiKey')}`,
    { email, oobCode: link.searchParams.get('oobCode') }
  );

  const res = await fetch(`${API_BASE_URL}/me/account`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` }
  });

  if (res.ok) {
    return;
  }

  if (res.status >= 500) {
    throw new Error(
      `the API kept ${email}: DELETE /me/account answered ${res.status}`
    );
  }

  await identityToolkit(
    `${IDENTITY_TOOLKIT}/projects/${admin.projectId}/accounts:delete`,
    { localId },
    admin.accessToken
  );
}
