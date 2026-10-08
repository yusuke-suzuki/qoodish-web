import type { Instrumentation } from 'next';

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context
) => {
  console.error(error);

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
