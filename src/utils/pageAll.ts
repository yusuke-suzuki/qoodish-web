export type Cursor = {
  created_at: string;
  id: number;
};

type Options = {
  maxRequests: number;
};

// The walk terminates on its own: a page that returns nothing, or that ends on
// the row the cursor already named, stops it. `maxRequests` is a budget rather
// than a guard — every page is a round trip the sitemap route waits on, so the
// cost of the walk, not the number of URLs it yields, is what is capped.
export default async function pageAll<T extends Cursor>(
  fetchPage: (cursor?: Cursor) => Promise<T[]>,
  { maxRequests }: Options
): Promise<T[]> {
  const collected: T[] = [];
  let cursor: Cursor | undefined;

  for (let request = 0; request < maxRequests; request++) {
    const batch = await fetchPage(cursor);
    const last = batch[batch.length - 1];

    if (!last || last.id === cursor?.id) {
      break;
    }

    collected.push(...batch);
    cursor = { created_at: last.created_at, id: last.id };
  }

  return collected;
}
