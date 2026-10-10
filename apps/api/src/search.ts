import { and, or, type SQL, type SQLWrapper, sql } from 'drizzle-orm';

const INDEXED_TERM_LENGTH = 3;
const FULLTEXT_TERM_LENGTH = 2;

export type SearchTarget = {
  index: string;
  id: SQLWrapper;
  columns: SQLWrapper[];
};

export function searchTerms(input: string): string[] {
  return [
    ...new Set(
      input
        .replaceAll('"', '')
        .split(/\s+/u)
        .filter((term) => term.length > 0)
    )
  ];
}

function characters(term: string): number {
  return [...term].length;
}

function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, '\\$&');
}

function phrase(term: string): string {
  return `"${term.replaceAll('"', '""')}"`;
}

export function searchCondition(
  input: string,
  target: SearchTarget
): SQL | null {
  const terms = searchTerms(input);

  if (terms.every((term) => characters(term) < FULLTEXT_TERM_LENGTH)) {
    return null;
  }

  const indexed = terms.filter(
    (term) => characters(term) >= INDEXED_TERM_LENGTH
  );
  const scanned = terms.filter(
    (term) => characters(term) < INDEXED_TERM_LENGTH
  );
  const index = sql.identifier(target.index);
  const conditions: SQL[] = [];

  if (indexed.length > 0) {
    conditions.push(
      sql`${target.id} IN (SELECT rowid FROM ${index} WHERE ${index} MATCH ${indexed.map(phrase).join(' AND ')})`
    );
  }

  for (const term of scanned) {
    const pattern = `%${escapeLike(term)}%`;

    conditions.push(
      or(
        ...target.columns.map(
          (column) => sql`${column} LIKE ${pattern} ESCAPE '\\'`
        )
      ) as SQL
    );
  }

  return and(...conditions) as SQL;
}
