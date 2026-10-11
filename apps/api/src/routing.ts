import { and, type Column, type SQL } from 'drizzle-orm';
import { validator } from 'hono/validator';
import type { z } from 'zod';
import { before, decodeCursor, type FeedCursor } from './cursor.ts';
import { ApiError } from './errors.ts';

export function jsonInput<Schema extends z.ZodType>(schema: Schema) {
  return validator('json', (value): z.output<Schema> => {
    const parsed = schema.safeParse(value);

    if (!parsed.success) {
      throw new ApiError('BadRequest');
    }

    return parsed.data;
  });
}

export function characters(text: string): number {
  return [...text].length;
}

export function truncate(text: string, length: number): string {
  const omission = '...';

  if (characters(text) <= length) {
    return text;
  }

  return `${[...text].slice(0, length - omission.length).join('')}${omission}`;
}

export function toId(param: string | undefined): number {
  const id = Number.parseInt(param ?? '', 10);

  return Number.isNaN(id) ? 0 : id;
}

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
  condition: SQL
): SQL {
  if (cursor === undefined || cursor === '') {
    return condition;
  }

  const decoded = typeof cursor === 'string' ? decodeCursor(cursor) : cursor;

  return and(condition, before(decoded, createdAt, id)) as SQL;
}
