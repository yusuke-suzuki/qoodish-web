import { and, type Column, eq, lt, or, type SQL } from 'drizzle-orm';
import { decodeBase64Url, encodeBase64Url } from 'hono/utils/encode';
import { ApiError } from './errors.ts';

export const FEED_PER_PAGE = 12;

export type FeedCursor = {
  createdAt: string;
  id: number;
};

const TIMESTAMP =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i;

const FIELD_RANGES: readonly (readonly [number, number])[] = [
  [1, 12],
  [1, 31],
  [0, 24],
  [0, 59],
  [0, 60]
];

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
  const fields = [month, day, hour, minute, second].map((part) =>
    Number(part ?? 0)
  );

  if (
    fields.some(
      (value, index) =>
        value < FIELD_RANGES[index][0] || value > FIELD_RANGES[index][1]
    )
  ) {
    throw new ApiError('BadRequest');
  }

  const [monthNumber, dayNumber, hours, minutes, seconds] = fields;
  const utc =
    Date.UTC(
      Number(year),
      monthNumber - 1,
      dayNumber,
      hours,
      minutes,
      seconds
    ) -
    offsetMinutes(zone) * 60_000;

  const wholeSeconds = new Date(utc).toISOString().slice(0, 19);
  const micros = (fraction ?? '').slice(0, 6).padEnd(6, '0');

  return `${wholeSeconds}.${micros}Z`;
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
