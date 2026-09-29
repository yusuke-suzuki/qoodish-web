import { NextResponse } from 'next/server';
import { readBodyWithinLimit } from '../../../utils/readBodyWithinLimit.ts';

const MAX_BODY_BYTES = 8 * 1024;

type ClientErrorReport = {
  message: string;
  stack?: string;
  digest?: string;
  url?: string;
  source?: string;
};

export async function POST(request: Request) {
  const origin = request.headers.get('origin');

  // The Origin check only stops cross-site browsers; a scripted caller is
  // bounded by the WAF rate limiting rule on this path.
  if (origin && origin !== new URL(request.url).origin) {
    return new NextResponse(null, { status: 403 });
  }

  const body = await readBodyWithinLimit(request, MAX_BODY_BYTES);

  if (body === null) {
    return new NextResponse(null, { status: 413 });
  }

  let report: ClientErrorReport;

  try {
    report = JSON.parse(body);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (typeof report?.message !== 'string') {
    return new NextResponse(null, { status: 400 });
  }

  // Same shape as the server-side error line, so one query covers both.
  console.error(
    JSON.stringify({
      kind: 'client-error',
      message: report.message,
      stack_trace: report.stack,
      digest: report.digest,
      url: report.url,
      source: report.source,
      userAgent: request.headers.get('user-agent')
    })
  );

  return new NextResponse(null, { status: 204 });
}
