import type { Chapter } from '../../types';
import { extractSpots } from './chapterContent';

export function journeyDate(chapter: Chapter): string {
  return (
    extractSpots(chapter.content).find((spot) => spot.checked_in_at !== null)
      ?.checked_in_at ?? chapter.created_at
  );
}
