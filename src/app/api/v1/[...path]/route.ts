import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

type Params = {
  params: Promise<{ path: string[] }>;
};

const ALLOWED_GUEST_GET_PATTERNS = [
  /^guest\/maps$/,
  /^guest\/users\/\d+\/maps$/
];

const ALLOWED_AUTH_POST_PATTERNS = [/^users$/];

type PathClass = 'guest' | 'auth' | 'unknown';

function classifyPath(joinedPath: string, method: string): PathClass {
  if (
    method === 'GET' &&
    ALLOWED_GUEST_GET_PATTERNS.some((pattern) => pattern.test(joinedPath))
  ) {
    return 'guest';
  }
  if (
    method === 'POST' &&
    ALLOWED_AUTH_POST_PATTERNS.some((pattern) => pattern.test(joinedPath))
  ) {
    return 'auth';
  }
  return 'unknown';
}

async function proxyRequest(request: NextRequest, { params }: Params) {
  const { path } = await params;
  const joinedPath = path.join('/');
  const classification = classifyPath(joinedPath, request.method);

  if (classification === 'unknown') {
    return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('__session')?.value;

  if (classification === 'auth' && !token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const apiUrl = `${process.env.API_ENDPOINT}/${joinedPath}${url.search}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language':
      request.headers.get('accept-language')?.split(',')[0] ?? 'en'
  };

  if (classification === 'auth' && token) {
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
    console.error(`Proxy error for /${joinedPath}:`, error);
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
