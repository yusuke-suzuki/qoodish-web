import type { JourneyPathPoint } from '../../types/index.ts';
import { distanceInMeters } from './geo.ts';

const CHECKIN_RADIUS_METERS = 50;
const PATH_MIN_DISTANCE_METERS = 10;

// A coarse fix can report a spot as reachable from far outside the check-in
// radius, so anything less certain than this is only used to draw the trail.
const CHECKIN_MAX_ACCURACY_METERS = 100;

const ACCURACY_UPGRADE_RADIUS_METERS = 300;
const ACCURACY_DOWNGRADE_RADIUS_METERS = 500;

// The Geolocation API offers no interval or distance filter, so a registered
// watch keeps the positioning hardware powered the whole time. Away from any
// unvisited spot the journey samples on a timer instead, and the hardware can
// power down between fixes.
export const MOVING_SAMPLE_MIN_INTERVAL_MS = 15000;
const MOVING_SAMPLE_MAX_INTERVAL_MS = 2 * 60 * 1000;

// Headroom over the observed speed, so that speeding up between two samples
// cannot carry the traveller into the continuous-watch zone unseen.
const SPEED_HEADROOM = 2;
const MIN_ASSUMED_SPEED_MPS = 1.5;

// Positioning jitter alone can move a fix this far while the device rests.
const STATIONARY_RADIUS_METERS = 30;
const STATIONARY_AFTER_MS = 3 * 60 * 1000;
const STATIONARY_SAMPLE_BASE_INTERVAL_MS = 30000;
const STATIONARY_BACKOFF_MAX_STEPS = 4;

// Near a spot a stale fix could miss a departure that heads straight into
// the check-in radius, so the backoff stays tighter there.
const STATIONARY_SAMPLE_MAX_NEAR_MS = 60000;
const STATIONARY_SAMPLE_MAX_FAR_MS = 5 * 60 * 1000;

export type StationaryAnchor = {
  latitude: number;
  longitude: number;
  accuracy: number;
  since: number;
};

export type TrackingFix = {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  timestamp: number;
};

export type PreviousFix = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

export type TrackedSpot = {
  latitude: number;
  longitude: number;
};

export type AnchorState = {
  anchor: StationaryAnchor | null;
  stationary: boolean;
};

export function nextAnchorState(
  prior: AnchorState,
  fix: TrackingFix
): AnchorState {
  const precise = fix.accuracy <= CHECKIN_MAX_ACCURACY_METERS;

  const opened: StationaryAnchor = {
    latitude: fix.latitude,
    longitude: fix.longitude,
    accuracy: fix.accuracy,
    since: fix.timestamp
  };

  const { anchor } = prior;

  if (
    anchor &&
    distanceInMeters(fix, anchor) >
      Math.max(STATIONARY_RADIUS_METERS, fix.accuracy, anchor.accuracy)
  ) {
    // The fix's error circle excludes the anchor, so this is genuine
    // movement even when the fix itself is coarse.
    return { anchor: precise ? opened : null, stationary: false };
  }

  if (!anchor) {
    // Only a precise fix may open an anchor: a coarse one would widen the
    // stillness radius so far that a stroll would read as rest.
    return { anchor: precise ? opened : null, stationary: false };
  }

  if (precise) {
    return {
      anchor,
      stationary: fix.timestamp - anchor.since >= STATIONARY_AFTER_MS
    };
  }

  // A coarse fix inside the stillness radius proves nothing either way.
  return prior;
}

export function shouldExtendTrail(
  lastPoint: JourneyPathPoint | null,
  fix: TrackingFix
): boolean {
  if (!lastPoint) {
    return true;
  }

  // A coarse fix drifts on its own, so the threshold follows the reported
  // accuracy to keep those jumps out of the trail.
  const minDistance = Math.max(PATH_MIN_DISTANCE_METERS, fix.accuracy);

  return distanceInMeters(fix, lastPoint) >= minDistance;
}

export function nearestSpotDistance(
  from: TrackedSpot,
  spots: TrackedSpot[]
): number {
  return spots.reduce(
    (shortest, spot) => Math.min(shortest, distanceInMeters(from, spot)),
    Number.POSITIVE_INFINITY
  );
}

export function nextHighAccuracy(
  enabled: boolean,
  nearestMeters: number
): boolean {
  return enabled
    ? nearestMeters <= ACCURACY_DOWNGRADE_RADIUS_METERS
    : nearestMeters <= ACCURACY_UPGRADE_RADIUS_METERS;
}

export function stationarySampleIntervalMs(
  anchor: StationaryAnchor,
  timestamp: number,
  nearestMeters: number
): number {
  const steps = Math.min(
    STATIONARY_BACKOFF_MAX_STEPS,
    Math.floor((timestamp - anchor.since) / STATIONARY_AFTER_MS)
  );

  const cap =
    nearestMeters <= ACCURACY_DOWNGRADE_RADIUS_METERS
      ? STATIONARY_SAMPLE_MAX_NEAR_MS
      : STATIONARY_SAMPLE_MAX_FAR_MS;

  return Math.min(cap, STATIONARY_SAMPLE_BASE_INTERVAL_MS * 2 ** steps);
}

export function movingSampleIntervalMs(
  fix: TrackingFix,
  previousFix: PreviousFix | null,
  nearestMeters: number
): number {
  let observedSpeed = fix.speed ?? Number.NaN;

  if (!Number.isFinite(observedSpeed) || observedSpeed < 0) {
    observedSpeed =
      previousFix && fix.timestamp > previousFix.timestamp
        ? distanceInMeters(fix, previousFix) /
          ((fix.timestamp - previousFix.timestamp) / 1000)
        : 0;
  }

  const speed = Math.max(MIN_ASSUMED_SPEED_MPS, observedSpeed * SPEED_HEADROOM);

  // The next sample only has to land before the traveller could reach
  // the continuous-watch zone around the nearest unvisited spot.
  const travelMs =
    ((nearestMeters - ACCURACY_UPGRADE_RADIUS_METERS) / speed) * 1000;

  return Math.min(
    MOVING_SAMPLE_MAX_INTERVAL_MS,
    Math.max(MOVING_SAMPLE_MIN_INTERVAL_MS, travelMs)
  );
}

export function reachedSpots<S extends TrackedSpot>(
  fix: TrackingFix,
  spots: S[]
): S[] {
  if (fix.accuracy > CHECKIN_MAX_ACCURACY_METERS) {
    return [];
  }

  return spots.filter(
    (spot) => distanceInMeters(fix, spot) <= CHECKIN_RADIUS_METERS
  );
}

export type TrackingState = {
  anchor: StationaryAnchor | null;
  stationary: boolean;
  previousFix: PreviousFix | null;
  lastTrailPoint: JourneyPathPoint | null;
};

export type TrackingDecision<S extends TrackedSpot> = {
  anchor: StationaryAnchor | null;
  stationary: boolean;
  extendTrail: boolean;
  nearestMeters: number;
  sampleIntervalMs: number;
  reached: S[];
};

export function trackPosition<S extends TrackedSpot>(
  state: TrackingState,
  fix: TrackingFix,
  remainingSpots: S[]
): TrackingDecision<S> {
  const { anchor, stationary } = nextAnchorState(state, fix);
  const nearestMeters = nearestSpotDistance(fix, remainingSpots);

  const sampleIntervalMs =
    stationary && anchor
      ? stationarySampleIntervalMs(anchor, fix.timestamp, nearestMeters)
      : movingSampleIntervalMs(fix, state.previousFix, nearestMeters);

  return {
    anchor,
    stationary,
    extendTrail: shouldExtendTrail(state.lastTrailPoint, fix),
    nearestMeters,
    sampleIntervalMs,
    reached: reachedSpots(fix, remainingSpots)
  };
}
