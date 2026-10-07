export const MAPS_TAG = 'maps';
export const PINS_TAG = 'pins';
export const CHAPTERS_TAG = 'chapters';
export const CONTENT_TAG = 'content';

export function mapTag(mapId: number | string): string {
  return `map:${mapId}`;
}

export function pinTag(pinId: number | string): string {
  return `pin:${pinId}`;
}

export function chapterTag(chapterId: number | string): string {
  return `chapter:${chapterId}`;
}

export function userTag(userId: number | string): string {
  return `user:${userId}`;
}
