const MAX_REPORTS_PER_PAGE = 5;
const MAX_STACK_LENGTH = 4000;

// Browsers fire this for layout loops that resolve on the next frame; it is
// not actionable and would crowd out real errors.
const IGNORED_MESSAGE = /ResizeObserver loop/;

let reported = 0;

export default function reportClientError(
  error: unknown,
  source: string
): void {
  console.error(error);

  const detail =
    error instanceof Error
      ? {
          message: error.message,
          stack: error.stack?.slice(0, MAX_STACK_LENGTH),
          digest: (error as { digest?: string }).digest
        }
      : { message: String(error) };

  if (
    reported >= MAX_REPORTS_PER_PAGE ||
    IGNORED_MESSAGE.test(detail.message)
  ) {
    return;
  }

  reported += 1;

  fetch('/api/errors', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({ ...detail, source, url: location.href })
  }).catch(() => {});
}
