import type { Comment } from '@qoodish/api-contract';
import { type CommentRow, guestComment } from '../guest/comments.ts';

export function viewerComment(row: CommentRow): Comment {
  const { likes_count, created_at, updated_at, ...comment } = guestComment(row);

  return {
    ...comment,
    liked: row.liked,
    likes_count,
    created_at,
    updated_at
  };
}
