import { NextResponse } from 'next/server';

// A static render would freeze the response at build time and a cached one
// would keep answering for the previous deploy, so both are ruled out here or
// the post-deploy workflow could never see the new commit arrive.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      sha: process.env.DEPLOYED_COMMIT_SHA ?? 'unknown',
      appEnv: process.env.APP_ENV ?? 'unknown',
      time: new Date().toISOString()
    },
    { headers: { 'cache-control': 'no-store' } }
  );
}
