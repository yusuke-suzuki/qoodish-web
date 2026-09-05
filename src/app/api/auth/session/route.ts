import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyIdToken } from '../../../../lib/auth.ts';

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

    cookieStore.set('__session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/'
    });
  } else {
    cookieStore.delete('__session');
  }

  return NextResponse.json({ status: 'ok' });
}
