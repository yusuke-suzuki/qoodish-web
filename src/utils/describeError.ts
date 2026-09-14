export default function describeError(error: unknown): string {
  const description = String(error);

  if (error instanceof Error && error.cause instanceof Error) {
    return `${description} (cause: ${String(error.cause)})`;
  }

  return description;
}
