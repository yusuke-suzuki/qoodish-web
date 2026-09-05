import { NextResponse } from 'next/server';

const MAX_BODY_BYTES = 8 * 1024;

type ClientErrorReport = {
  message: string;
  stack?: string;
  digest?: string;
  url?: string;
  source?: string;
};

// request.text() would buffer the whole body before any check could run, so
// the stream is counted chunk by chunk and dropped once it passes the limit.
async function readBodyWithinLimit(request: Request): Promise<string | null> {
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) {
    return null;
  }

  const reader = request.body?.getReader();

  if (!reader) {
    return '';
  }

  const decoder = new TextDecoder();
  let received = 0;
  let text = '';

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    received += value.byteLength;

    if (received > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }

    text += decoder.decode(value, { stream: true });
  }

  return text + decoder.decode();
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');

  if (origin && origin !== new URL(request.url).origin) {
    return new NextResponse(null, { status: 403 });
  }

  const body = await readBodyWithinLimit(request);

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

  console.error(
    JSON.stringify({
      kind: 'client-error',
      message: report.message,
      stack: report.stack,
      digest: report.digest,
      url: report.url,
      source: report.source,
      userAgent: request.headers.get('user-agent')
    })
  );

  return new NextResponse(null, { status: 204 });
}
