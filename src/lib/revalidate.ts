import { revalidateTag } from 'next/cache';

// Guest pages are served from cache for minutes; a write has to discard what
// it changed or the author watches the old version keep serving.
export function revalidateTags(tags: (string | null | undefined)[]): void {
  for (const tag of tags) {
    if (tag) {
      revalidateTag(tag, 'max');
    }
  }
}
