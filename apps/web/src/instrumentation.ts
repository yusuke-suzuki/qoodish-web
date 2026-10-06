import type { Instrumentation } from 'next';

// The telemetry export only sees console output, so the error is serialized
// as one JSON line the log backend can index by field.
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context
) => {
  const detail =
    error instanceof Error
      ? { name: error.name, message: error.message, stack_trace: error.stack }
      : { message: String(error) };
  const digest =
    typeof error === 'object' && error !== null && 'digest' in error
      ? String(error.digest)
      : undefined;

  console.error(
    JSON.stringify({
      kind: 'request-error',
      ...detail,
      digest,
      // The query can carry credentials such as the email sign-in code.
      path: request.path.split('?', 1)[0],
      method: request.method,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource
    })
  );
};
