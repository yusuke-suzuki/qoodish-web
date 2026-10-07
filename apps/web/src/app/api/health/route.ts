import { NextResponse } from 'next/server';

// A static render would freeze the response at build time and a cached one
// would keep answering for the previous deploy, so both are ruled out here or
// the post-deploy workflow could never see the new commit arrive.
export const dynamic = 'force-dynamic';

async function checkApi(): Promise<'ok' | 'failed'> {
  try {
    const res = await fetch(`${process.env.API_ENDPOINT}/healthcheck`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    });

    return res.ok ? 'ok' : 'failed';
  } catch {
    return 'failed';
  }
}

// The status code carries the verdict so any external monitor can judge the
// endpoint without parsing the body, while the body keeps the SHA the
// post-deploy workflow reads even during an API outage.
export async function GET() {
  const api = await checkApi();

  return NextResponse.json(
    {
      status: api === 'ok' ? 'ok' : 'degraded',
      checks: { api },
      sha: process.env.DEPLOYED_COMMIT_SHA ?? 'unknown',
      appEnv: process.env.APP_ENV ?? 'unknown',
      time: new Date().toISOString()
    },
    {
      status: api === 'ok' ? 200 : 503,
      headers: { 'cache-control': 'no-store' }
    }
  );
}
