import { or, type SQL, type SQLWrapper, sql } from 'drizzle-orm';
import { ApiError } from './errors.ts';

export const FEED_PER_PAGE = 12;

export type FeedCursor = {
  createdAt: string;
  id: number;
};

const TIMESTAMP =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i;

function decodeBase64Url(token: string): string {
  if (!/^[A-Za-z0-9_-]*={0,2}$/.test(token)) {
    throw new ApiError('BadRequest');
  }

  const base64 = token.replaceAll('-', '+').replaceAll('_', '/');

  try {
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(
      Uint8Array.from(binary, (char) => char.charCodeAt(0))
    );
  } catch {
    throw new ApiError('BadRequest');
  }
}

function offsetMinutes(zone: string | undefined): number {
  if (!zone || zone.toUpperCase() === 'Z') {
    return 0;
  }

  const digits = zone.replace(':', '');
  const minutes = Number(digits.slice(1, 3)) * 60 + Number(digits.slice(3, 5));

  return digits.startsWith('-') ? -minutes : minutes;
}

export function normalizeTimestamp(text: string): string {
  const match = TIMESTAMP.exec(text.trim());

  if (!match) {
    throw new ApiError('BadRequest');
  }

  const [, year, month, day, hour, minute, second, fraction, zone] = match;
  const utc =
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour ?? 0),
      Number(minute ?? 0),
      Number(second ?? 0)
    ) -
    offsetMinutes(zone) * 60_000;

  if (Number.isNaN(utc)) {
    throw new ApiError('BadRequest');
  }

  const seconds = new Date(utc).toISOString().slice(0, 19);
  const micros = (fraction ?? '').slice(0, 6).padEnd(6, '0');

  return `${seconds}.${micros}Z`;
}

export function decodeCursor(token: string): FeedCursor {
  const decoded = decodeBase64Url(token);
  const separator = decoded.indexOf(',');
  const timestamp = separator === -1 ? decoded : decoded.slice(0, separator);
  const id = separator === -1 ? undefined : decoded.slice(separator + 1);

  if (id === undefined || !/^[1-9]\d*$/.test(id)) {
    throw new ApiError('BadRequest');
  }

  return { createdAt: normalizeTimestamp(timestamp), id: Number(id) };
}

export function encodeCursor({ createdAt, id }: FeedCursor): string {
  return btoa(`${createdAt},${id}`)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
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
  createdAt: SQLWrapper,
  id: SQLWrapper
): SQL {
  return or(
    sql`${createdAt} < ${cursor.createdAt}`,
    sql`(${createdAt} = ${cursor.createdAt} AND ${id} < ${cursor.id})`
  ) as SQL;
}
