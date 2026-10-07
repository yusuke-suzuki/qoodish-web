const KEY_PREFIX = 'qoodish.journeyPaused.v1';

function storageKey(uid: string, journeyId: number): string {
  return `${KEY_PREFIX}:${uid}:${journeyId}`;
}

export function loadPaused(uid: string, journeyId: number): boolean {
  try {
    return window.localStorage.getItem(storageKey(uid, journeyId)) !== null;
  } catch (_error) {
    return false;
  }
}

export function savePaused(uid: string, journeyId: number, paused: boolean) {
  try {
    if (paused) {
      window.localStorage.setItem(storageKey(uid, journeyId), '1');
    } else {
      window.localStorage.removeItem(storageKey(uid, journeyId));
    }
  } catch (_error) {}
}

export function deletePaused(uid: string, journeyId: number): void {
  try {
    window.localStorage.removeItem(storageKey(uid, journeyId));
  } catch (_error) {}
}
