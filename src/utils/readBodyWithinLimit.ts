export async function readBodyWithinLimit(
  request: Request,
  maxBytes: number
): Promise<string | null> {
  if (Number(request.headers.get('content-length')) > maxBytes) {
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

    if (received > maxBytes) {
      await reader.cancel();
      return null;
    }

    text += decoder.decode(value, { stream: true });
  }

  return text + decoder.decode();
}
