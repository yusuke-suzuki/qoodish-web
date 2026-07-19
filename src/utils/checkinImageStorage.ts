import type { Image } from '../../types';

const KEY_PREFIX = 'qoodish.checkinImages.v1';

export type CheckinImages = Record<number, Image[]>;

function storageKey(uid: string, journeyId: number): string {
  return `${KEY_PREFIX}:${uid}:${journeyId}`;
}

export function loadCheckinImages(
  uid: string,
  journeyId: number
): CheckinImages {
  try {
    const raw = window.localStorage.getItem(storageKey(uid, journeyId));

    return raw ? (JSON.parse(raw) as CheckinImages) : {};
  } catch (_error) {
    return {};
  }
}

export function saveCheckinImages(
  uid: string,
  journeyId: number,
  images: CheckinImages
): void {
  try {
    window.localStorage.setItem(
      storageKey(uid, journeyId),
      JSON.stringify(images)
    );
  } catch (_error) {}
}

export function deleteCheckinImages(uid: string, journeyId: number): void {
  try {
    window.localStorage.removeItem(storageKey(uid, journeyId));
  } catch (_error) {}
}
