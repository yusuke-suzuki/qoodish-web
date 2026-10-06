import type { ContentRef } from '../../types/index.ts';
import { chapterTag, pinTag } from './cacheTags.ts';

const API_SEGMENT: Record<ContentRef['type'], string> = {
  pin: 'pins',
  chapter: 'chapters'
};

const CACHE_TAG: Record<ContentRef['type'], (id: number) => string> = {
  pin: pinTag,
  chapter: chapterTag
};

export function commentsPath(subject: ContentRef): string {
  return `/${API_SEGMENT[subject.type]}/${subject.id}/comments`;
}

export function cacheTagFor(subject: ContentRef): string {
  return CACHE_TAG[subject.type](subject.id);
}
