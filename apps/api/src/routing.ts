import { and, type Column, type SQL } from 'drizzle-orm';
import { before, type FeedCursor } from './cursor.ts';
import { ApiError } from './errors.ts';

export function present(value: string | null | undefined): value is string {
  return value !== undefined && value !== null && value.trim().length > 0;
}

export function first<Row>(rows: readonly Row[]): Row {
  const [row] = rows;

  if (row === undefined) {
    throw new ApiError('NotFound');
  }

  return row;
}

export function feedPage(
  cursor: FeedCursor | undefined,
  createdAt: Column,
  id: Column,
  condition: SQL | undefined
): SQL | undefined {
  return cursor === undefined
    ? condition
    : and(condition, before(cursor, createdAt, id));
}
