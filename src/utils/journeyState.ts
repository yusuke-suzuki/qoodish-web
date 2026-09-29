import type { Image, Journey, JourneyCheckin, Pin } from '../../types/index.ts';

export const INACTIVITY_PAUSE_MS = 8 * 60 * 60 * 1000;

export type RemainingSpots = {
  pins: Pin[];
  checkins: JourneyCheckin[];
  spots: Pin[];
};

export function remainingSpots(
  previous: RemainingSpots | null,
  pins: Pin[],
  checkins: JourneyCheckin[]
): RemainingSpots {
  if (previous && previous.pins === pins && previous.checkins === checkins) {
    return previous;
  }

  const visitedIds = new Set(checkins.map((checkin) => checkin.pin_id));

  return {
    pins,
    checkins,
    spots: pins.filter((pin) => !visitedIds.has(pin.id))
  };
}

export function isRecording(
  canRecord: boolean,
  journey: Journey | null,
  paused: boolean
): boolean {
  return Boolean(
    canRecord && journey?.started_at && !journey.finished_at && !paused
  );
}

export function isInactive(
  lastPositionAt: number | null,
  now: number
): boolean {
  return Boolean(lastPositionAt) && now - lastPositionAt >= INACTIVITY_PAUSE_MS;
}

export function isEmptyPlan(journey: Journey): boolean {
  return (
    !journey.started_at &&
    journey.milestones.length < 1 &&
    journey.checkins.length < 1
  );
}

export function withReplacedCheckin(
  journey: Journey,
  next: JourneyCheckin
): Journey {
  return {
    ...journey,
    checkins: journey.checkins.map((checkin) =>
      checkin.id === next.id ? next : checkin
    )
  };
}

export function withoutCheckin(journey: Journey, checkinId: number): Journey {
  return {
    ...journey,
    checkins: journey.checkins.filter((checkin) => checkin.id !== checkinId)
  };
}

export function imageIdsWith(images: Image[], imageId: number): number[] {
  return [...images.map((image) => image.id), imageId];
}

export function imageIdsWithout(images: Image[], imageId: number): number[] {
  return images
    .filter((image) => image.id !== imageId)
    .map((image) => image.id);
}
