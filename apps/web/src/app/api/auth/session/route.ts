import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SIGNED_IN_COOKIE, verifyIdToken } from '../../../../lib/auth.ts';

// The ID token in __session expires within the hour, so a reader who comes
// back the next day arrives without one and the server cannot tell them from
// someone who has never signed in. This outlives it and says only that the
// browser had a session, which is enough to withhold the landing page.
const SIGNED_IN_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  // Browsers always attach Origin to cross-site POSTs, so a missing header
  // cannot be a CSRF attempt and only a mismatch is rejected.
  const origin = request.headers.get('origin');

  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let idToken: unknown;

  try {
    ({ idToken } = await request.json());
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();

  if (typeof idToken === 'string' && idToken !== '') {
    if (!(await verifyIdToken(idToken))) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/'
    };

    cookieStore.set('__session', idToken, { ...options, maxAge: 60 * 60 });
    cookieStore.set(SIGNED_IN_COOKIE, '1', {
      ...options,
      maxAge: SIGNED_IN_MAX_AGE
    });
  } else {
    cookieStore.delete('__session');
    cookieStore.delete(SIGNED_IN_COOKIE);
  }

  return NextResponse.json({ status: 'ok' });
}
