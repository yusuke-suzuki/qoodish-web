import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyIdToken } from '../../../../lib/auth.ts';
import {
  clearedSessionCookies,
  sessionCookies
} from '../../../../lib/session.ts';

export async function POST(request: Request) {
  // Browsers always attach Origin to cross-site POSTs, so a missing header
  // cannot be a CSRF attempt and only a mismatch is rejected.
  const origin = request.headers.get('origin');

  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let idToken: unknown;
  let refreshToken: unknown;

  try {
    ({ idToken, refreshToken } = await request.json());
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

    for (const { name, value, options } of sessionCookies(
      idToken,
      typeof refreshToken === 'string' && refreshToken !== ''
        ? refreshToken
        : null
    )) {
      cookieStore.set(name, value, options);
    }
  } else {
    for (const { name, value, options } of clearedSessionCookies()) {
      cookieStore.set(name, value, options);
    }
  }

  return NextResponse.json({ status: 'ok' });
}
