import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { idToken } = await request.json();
  const cookieStore = await cookies();

  if (idToken) {
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
