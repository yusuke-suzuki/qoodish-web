import type { Instrumentation } from 'next';

// Workers Logs and the tail worker only see console output, so the error is
// serialized as one JSON line they can filter on.
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context
) => {
  const detail =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
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
      path: request.path,
      method: request.method,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource
    })
  );
};
