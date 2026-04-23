import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

type Params = {
  params: Promise<{ path: string[] }>;
};

const ALLOWED_GET_PATTERNS = [/^maps$/, /^users\/\d+\/maps$/, /^guest\/maps$/];

const ALLOWED_POST_PATTERNS = [/^users$/];

function isAllowedPath(joinedPath: string, method: string): boolean {
  const patterns =
    method === 'POST' ? ALLOWED_POST_PATTERNS : ALLOWED_GET_PATTERNS;
  return patterns.some((pattern) => pattern.test(joinedPath));
}

async function proxyRequest(request: NextRequest, { params }: Params) {
  const { path } = await params;
  const joinedPath = path.join('/');

  if (!isAllowedPath(joinedPath, request.method)) {
    return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('__session')?.value;

  const url = new URL(request.url);
  const isGuestPath = joinedPath.startsWith('guest/');
  const apiPath =
    isGuestPath || token ? `/${joinedPath}` : `/guest/${joinedPath}`;
  const apiUrl = `${process.env.API_ENDPOINT}${apiPath}${url.search}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language':
      request.headers.get('accept-language')?.split(',')[0] ?? 'en'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit = {
    method: request.method,
    headers
  };

  if (request.method === 'POST') {
    headers['Content-Type'] = 'application/json';
    init.body = await request.text();
  }

  try {
    const res = await fetch(apiUrl, init);
    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'application/json'
      }
    });
  } catch (error) {
    console.error(`Proxy error for ${apiPath}:`, error);
    return NextResponse.json(
      { detail: 'Internal proxy error' },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: Params) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: Params) {
  return proxyRequest(request, context);
}
