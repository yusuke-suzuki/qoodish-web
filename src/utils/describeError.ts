function stringify(value: unknown): string {
  try {
    return String(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

export default function describeError(error: unknown): string {
  const description = stringify(error);

  if (error instanceof Error && error.cause instanceof Error) {
    return `${description} (cause: ${stringify(error.cause)})`;
  }

  return description;
}
