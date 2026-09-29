import { revalidateTag } from 'next/cache';

// Guest pages are served from cache for minutes; a write has to discard what
// it changed or the author watches the old version keep serving.
type Falsy = false | 0 | '' | null | undefined;

export function revalidateTags(tags: (string | Falsy)[]): void {
  for (const tag of tags) {
    if (tag) {
      revalidateTag(tag, 'max');
    }
  }
}
