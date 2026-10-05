import type { CursorPage } from '../../types/index.ts';

type Options = {
  maxRequests: number;
};

export default async function pageAll<T>(
  fetchPage: (cursor?: string) => Promise<CursorPage<T>>,
  { maxRequests }: Options
): Promise<T[]> {
  const collected: T[] = [];
  let cursor: string | undefined;

  for (let request = 0; request < maxRequests; request++) {
    const { items, nextCursor } = await fetchPage(cursor);
    collected.push(...items);

    if (!nextCursor || nextCursor === cursor) {
      break;
    }

    cursor = nextCursor;
  }

  return collected;
}
