import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { NextRequest } from 'next/server';
import { toDataPoint } from '../../../utils/analyticsEvent.ts';

const MAX_BODY_BYTES = 2048;

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  return origin !== null && origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return new Response(null, { status: 403 });
  }

  const body = await request.text();

  if (body.length > MAX_BODY_BYTES) {
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
