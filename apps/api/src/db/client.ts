import { type SQL, type SQLWrapper, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema.ts';

export function database(binding: D1Database) {
  return drizzle(binding, { schema });
}

export type Database = ReturnType<typeof database>;

export function inIds(column: SQLWrapper, ids: readonly number[]): SQL {
  return sql`${column} IN (SELECT value FROM json_each(${JSON.stringify(ids)}))`;
}

export function uniqueIds(ids: Iterable<number | null>): number[] {
  return [...new Set([...ids].filter((id): id is number => id !== null))];
}
