import type { Commentable } from '../../types/index.ts';
import { chapterTag, pinTag } from './cacheTags.ts';

const API_SEGMENT: Record<Commentable['type'], string> = {
  pin: 'pins',
  chapter: 'chapters'
};

const CACHE_TAG: Record<Commentable['type'], (id: number) => string> = {
  pin: pinTag,
  chapter: chapterTag
};

export function commentsPath(commentable: Commentable): string {
  return `/${API_SEGMENT[commentable.type]}/${commentable.id}/comments`;
}

export function commentableTag(commentable: Commentable): string {
  return CACHE_TAG[commentable.type](commentable.id);
}
