import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { NextRequest } from 'next/server';
import { toDataPoint } from '../../../utils/analyticsEvent.ts';
import { readBodyWithinLimit } from '../../../utils/readBodyWithinLimit.ts';

const MAX_BODY_BYTES = 2048;

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  return origin !== null && origin === request.nextUrl.origin;
}

async function withinRateLimit(request: NextRequest): Promise<boolean> {
  const limiter = getCloudflareContext().env.ANALYTICS_EVENTS_LIMIT;
  const ip = request.headers.get('cf-connecting-ip');

  if (!limiter || !ip) {
    return true;
  }

  return (await limiter.limit({ key: ip })).success;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return new Response(null, { status: 403 });
  }

  if (!(await withinRateLimit(request))) {
    return new Response(null, {
      status: 429,
      headers: { 'Retry-After': '60' }
    });
  }

  const body = await readBodyWithinLimit(request, MAX_BODY_BYTES);

  if (body === null) {
    return new Response(null, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response(null, { status: 400 });
  }

  const dataPoint = toDataPoint(payload);

  if (!dataPoint) {
    return new Response(null, { status: 400 });
  }

  getCloudflareContext().env.ANALYTICS_EVENTS?.writeDataPoint(dataPoint);

  return new Response(null, { status: 204 });
}
