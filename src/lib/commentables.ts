import type { Commentable } from '../../types/index.ts';
import { chapterTag, pinTag } from './cacheTags.ts';

const API_SEGMENT: Record<Commentable['type'], string> = {
  pin: 'pins',
  chapter: 'chapters'
};

export function commentsPath(commentable: Commentable): string {
  return `/${API_SEGMENT[commentable.type]}/${commentable.id}/comments`;
}

export function commentableTag(commentable: Commentable): string {
  return commentable.type === 'pin'
    ? pinTag(commentable.id)
    : chapterTag(commentable.id);
}
