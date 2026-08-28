import { type NextRequest, NextResponse } from 'next/server';
import {
  apiUrl,
  buildApiHeaders,
  DEFAULT_TIMEOUT_MS,
  getAuthToken,
  isTimeoutError,
  parseAcceptLanguage
} from '../../../../lib/apiRequest.ts';

type Params = {
  params: Promise<{ path: string[] }>;
};

const ALLOWED_GUEST_GET_PATTERNS = [
  /^guest\/maps$/,
  /^guest\/users\/\d+\/maps$/
];

const ALLOWED_AUTH_POST_PATTERNS = [/^users$/, /^images$/];

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

  const token = classification === 'auth' ? await getAuthToken() : null;

  if (classification === 'auth' && !token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);

  const init: RequestInit = {
    method: request.method,
    headers: buildApiHeaders({
      token,
      acceptLanguage: parseAcceptLanguage(
        request.headers.get('accept-language')
      )
    }),
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
  };

  if (request.method === 'POST') {
    init.body = await request.text();
  }

  try {
    const res = await fetch(apiUrl(`/${joinedPath}${url.search}`), init);
    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'application/json'
      }
    });
  } catch (error) {
    console.error(`Proxy error for /${joinedPath}:`, error);

    if (isTimeoutError(error)) {
      return NextResponse.json({ detail: 'Upstream timeout' }, { status: 504 });
    }

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
