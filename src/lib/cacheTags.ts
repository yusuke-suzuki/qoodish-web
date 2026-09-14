export const MAPS_TAG = 'maps';
export const REVIEWS_TAG = 'reviews';
export const CHAPTERS_TAG = 'chapters';
export const CONTENT_TAG = 'content';

export function mapTag(mapId: number | string): string {
  return `map:${mapId}`;
}

export function reviewTag(reviewId: number | string): string {
  return `review:${reviewId}`;
}

export function chapterTag(chapterId: number | string): string {
  return `chapter:${chapterId}`;
}

export function userTag(userId: number | string): string {
  return `user:${userId}`;
}
