import type { AppMap } from '../../types/index.ts';

export async function searchMaps(
  query: string,
  signal: AbortSignal
): Promise<AppMap[]> {
  const res = await fetch(
    `/api/v1/guest/maps?input=${encodeURIComponent(query)}`,
    { signal }
  );

  if (!res.ok) {
    throw new Error(`Map search failed with status ${res.status}`);
  }

  return (await res.json()) as AppMap[];
}
