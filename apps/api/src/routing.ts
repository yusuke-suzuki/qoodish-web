import { and, type Column, type SQL } from 'drizzle-orm';
import { before, decodeCursor, type FeedCursor } from './cursor.ts';
import { ApiError } from './errors.ts';

export function present(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

export function first<Row>(rows: readonly Row[]): Row {
  const [row] = rows;

  if (row === undefined) {
    throw new ApiError('NotFound');
  }

  return row;
}

export function feedPage(
  cursor: FeedCursor | string | undefined,
  createdAt: Column,
  id: Column,
  condition: SQL | undefined
): SQL | undefined {
  if (cursor === undefined || cursor === '') {
    return condition;
  }

  const decoded = typeof cursor === 'string' ? decodeCursor(cursor) : cursor;

  return and(condition, before(decoded, createdAt, id));
}
