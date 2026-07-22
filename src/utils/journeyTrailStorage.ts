import type { JourneyPathPoint } from '../../types';

const KEY_PREFIX = 'qoodish.journeyTrail.v1';

function storageKey(uid: string, journeyId: number): string {
  return `${KEY_PREFIX}:${uid}:${journeyId}`;
}

export function loadTrail(uid: string, journeyId: number): JourneyPathPoint[] {
  try {
    const raw = window.localStorage.getItem(storageKey(uid, journeyId));

    return raw ? (JSON.parse(raw) as JourneyPathPoint[]) : [];
  } catch (_error) {
    return [];
  }
}

export function saveTrail(
  uid: string,
  journeyId: number,
  points: JourneyPathPoint[]
): void {
  try {
    window.localStorage.setItem(
      storageKey(uid, journeyId),
      JSON.stringify(points)
    );
  } catch (_error) {}
}

export function deleteTrail(uid: string, journeyId: number): void {
  try {
    window.localStorage.removeItem(storageKey(uid, journeyId));
  } catch (_error) {}
}
