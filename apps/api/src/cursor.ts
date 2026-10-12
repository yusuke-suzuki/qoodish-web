import { and, type Column, eq, lt, or, type SQL } from 'drizzle-orm';
import { decodeBase64Url, encodeBase64Url } from 'hono/utils/encode';
import { ApiError } from './errors.ts';
import { parseTimestamp } from './timestamps.ts';

export const FEED_PER_PAGE = 12;

export type FeedCursor = {
  createdAt: string;
  id: number;
};

function decodeToken(token: string): string {
  if (!/^[A-Za-z0-9+/_-]*={0,2}$/.test(token)) {
    throw new ApiError('BadRequest');
  }

  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(
      decodeBase64Url(token)
    );
  } catch {
    throw new ApiError('BadRequest');
  }
}

export function normalizeTimestamp(text: string): string {
  const timestamp = parseTimestamp(text);

  if (timestamp === null) {
    throw new ApiError('BadRequest');
  }

  return timestamp;
}

export function decodeCursor(token: string): FeedCursor {
  const decoded = decodeToken(token);
  const separator = decoded.indexOf(',');
  const timestamp = separator === -1 ? decoded : decoded.slice(0, separator);
  const id = separator === -1 ? undefined : decoded.slice(separator + 1);

  if (id === undefined || !/^[1-9]\d*$/.test(id)) {
    throw new ApiError('BadRequest');
  }

  return { createdAt: normalizeTimestamp(timestamp), id: Number(id) };
}

export function encodeCursor({ createdAt, id }: FeedCursor): string {
  return encodeBase64Url(
    new TextEncoder().encode(`${createdAt},${id}`).buffer
  ).replace(/=+$/, '');
}

export function nextCursor(
  page: readonly FeedCursor[],
  perPage: number = FEED_PER_PAGE
): string | null {
  const last = page.at(-1);

  return last && page.length === perPage ? encodeCursor(last) : null;
}

export function before(
  cursor: FeedCursor,
  createdAt: Column,
  id: Column
): SQL | undefined {
  return or(
    lt(createdAt, cursor.createdAt),
    and(eq(createdAt, cursor.createdAt), lt(id, cursor.id))
  );
}
