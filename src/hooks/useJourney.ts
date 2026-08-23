'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type {
  AppMap,
  Image,
  Journey,
  JourneyCheckin,
  JourneyPathPoint,
  Milestone,
  Review
} from '../../types';
import {
  addCheckin,
  addMilestone as addMilestoneAction,
  deleteJourney,
  finishJourney,
  initJourney,
  removeCheckin as removeCheckinAction,
  removeMilestone as removeMilestoneAction,
  startJourney,
  updateCheckin
} from '../actions/journeys';
import AuthContext from '../context/AuthContext';
import { distanceInMeters } from '../utils/geo';
import {
  deletePaused,
  loadPaused,
  savePaused
} from '../utils/journeyPauseStorage';
import {
  deleteTrail,
  loadTrail,
  saveTrail
} from '../utils/journeyTrailStorage';
import { encodePath } from '../utils/polyline';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

const CHECKIN_RADIUS_METERS = 50;
const PATH_MIN_DISTANCE_METERS = 10;
const CHECKIN_VIBRATION_MS = 30;

// A coarse fix can report a spot as reachable from far outside the check-in
// radius, so anything less certain than this is only used to draw the trail.
const CHECKIN_MAX_ACCURACY_METERS = 100;

const ACCURACY_UPGRADE_RADIUS_METERS = 300;
const ACCURACY_DOWNGRADE_RADIUS_METERS = 500;

const INACTIVITY_PAUSE_MS = 8 * 60 * 60 * 1000;
const INACTIVITY_CHECK_INTERVAL_MS = 10 * 60 * 1000;
const INITIAL_POSITION_TIMEOUT_MS = 15000;

const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 10000
};

const LOW_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 60000
};

// The Geolocation API offers no interval or distance filter, so a registered
// watch keeps the positioning hardware powered the whole time. Away from any
// unvisited spot the journey samples on a timer instead, and the hardware can
// power down between fixes.
const MOVING_SAMPLE_MIN_INTERVAL_MS = 15000;
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

// A fix that never resolves would otherwise stall the sampling loop.
const SAMPLE_TIMEOUT_MS = 30000;

type StationaryAnchor = {
  latitude: number;
  longitude: number;
  accuracy: number;
  since: number;
};

export type PauseReason = 'permission' | 'inactivity';

type Args = {
  map: AppMap;
  reviews: Review[];
  initialJourney: Journey | null;
  canRecord: boolean;
  onCheckin: (review: Review) => void;
  onPosition: (position: GeolocationPosition) => void;
  onLocationError: () => void;
  onPaused: (reason: PauseReason) => void;
  onError: (message: string | null) => void;
};

type FinishedJourney = {
  journey: Journey;
  trail: JourneyPathPoint[];
};

export default function useJourney({
  map,
  reviews,
  initialJourney,
  canRecord,
  onCheckin,
  onPosition,
  onLocationError,
  onPaused,
  onError
}: Args) {
  const { uid, authenticated, setSignInRequired } = useContext(AuthContext);

  const [journey, setJourney] = useState<Journey | null>(initialJourney);
  const journeyRef = useRef<Journey | null>(initialJourney);

  const trailRef = useRef<JourneyPathPoint[]>([]);
  const [trail, setTrail] = useState<JourneyPathPoint[]>([]);

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [visible, setVisible] = useState(true);
  const [highAccuracy, setHighAccuracy] = useState(true);
  const [stationary, setStationary] = useState(false);
  const stationaryRef = useRef(false);
  const anchorRef = useRef<StationaryAnchor | null>(null);
  const lastFixRef = useRef<{
    latitude: number;
    longitude: number;
    timestamp: number;
  } | null>(null);
  const sampleIntervalRef = useRef(MOVING_SAMPLE_MIN_INTERVAL_MS);
  const lastPositionAtRef = useRef<number | null>(null);

  const reviewsRef = useRef(reviews);

  // The check-in path runs from geolocation callbacks rather than from a
  // render, so it reads the list through a ref instead of taking a dependency
  // on it and re-registering the watch every time the list changes. A fix that
  // arrived between the commit and a passive effect would read the previous
  // list, so the write happens in the commit phase.
  useIsomorphicLayoutEffect(() => {
    reviewsRef.current = reviews;
  }, [reviews]);

  const pendingCheckinsRef = useRef(new Set<number>());

  const commitJourney = useCallback((next: Journey | null) => {
    journeyRef.current = next;
    setJourney(next);
  }, []);

  const commitTrail = useCallback(
    (points: JourneyPathPoint[]) => {
      trailRef.current = points;
      setTrail(points);

      const current = journeyRef.current;

      if (uid && current) {
        saveTrail(uid, current.id, points);
      }
    },
    [uid]
  );

  const commitPaused = useCallback(
    (next: boolean) => {
      pausedRef.current = next;
      setPaused(next);

      // The gap that led to an inactivity pause would still be there on
      // resume and would pause the journey again right away. A stationary
      // anchor from before the pause would resume already backed off.
      if (!next) {
        lastPositionAtRef.current = null;
        lastFixRef.current = null;
        anchorRef.current = null;
        stationaryRef.current = false;
        setStationary(false);
        sampleIntervalRef.current = MOVING_SAMPLE_MIN_INTERVAL_MS;
      }

      const current = journeyRef.current;

      if (uid && current) {
        savePaused(uid, current.id, next);
      }
    },
    [uid]
  );

  // Must run before the watch effect below registers: a position delivered
  // while the stored trail is not yet hydrated would make commitTrail
  // overwrite it with a single fresh point.
  useEffect(() => {
    if (!uid) {
      return;
    }

    const current = journeyRef.current;

    if (current?.started_at && !current.finished_at) {
      const stored = loadTrail(uid, current.id);
      trailRef.current = stored;
      setTrail(stored);

      const storedPaused = loadPaused(uid, current.id);
      pausedRef.current = storedPaused;
      setPaused(storedPaused);
    }
  }, [uid]);

  const commitCheckin = useCallback(
    (journeyId: number, next: JourneyCheckin) => {
      const latest = journeyRef.current;

      if (!latest || latest.id !== journeyId) {
        return;
      }

      commitJourney({
        ...latest,
        checkins: latest.checkins.map((checkin) =>
          checkin.id === next.id ? next : checkin
        )
      });
    },
    [commitJourney]
  );

  const mutateCheckin = useCallback(
    async (
      checkin: JourneyCheckin,
      params: { image_ids?: number[]; note?: string | null }
    ): Promise<boolean> => {
      const current = journeyRef.current;

      if (!current) {
        return false;
      }

      const { success, data, error } = await updateCheckin(
        current.id,
        checkin.id,
        params
      );

      if (!success || !data) {
        onError(error ?? null);
        return false;
      }

      commitCheckin(current.id, data);
      return true;
    },
    [commitCheckin, onError]
  );

  const findLatestCheckin = useCallback((checkin: JourneyCheckin) => {
    return (
      journeyRef.current?.checkins.find(
        (existing) => existing.id === checkin.id
      ) ?? checkin
    );
  }, []);

  const attachCheckinImage = async (checkin: JourneyCheckin, image: Image) => {
    const latest = findLatestCheckin(checkin);

    await mutateCheckin(checkin, {
      image_ids: [...latest.images.map((existing) => existing.id), image.id]
    });
  };

  const removeCheckinImage = (
    checkin: JourneyCheckin,
    imageId: number
  ): Promise<boolean> => {
    const latest = findLatestCheckin(checkin);

    return mutateCheckin(checkin, {
      image_ids: latest.images
        .filter((existing) => existing.id !== imageId)
        .map((existing) => existing.id)
    });
  };

  const updateCheckinNote = async (
    checkin: JourneyCheckin,
    note: string | null
  ) => {
    await mutateCheckin(checkin, { note });
  };

  const performCheckin = useCallback(
    async (review: Review) => {
      const current = journeyRef.current;

      if (!current || pendingCheckinsRef.current.has(review.id)) {
        return;
      }

      pendingCheckinsRef.current.add(review.id);

      const { success, data } = await addCheckin(current.id, review.id);

      pendingCheckinsRef.current.delete(review.id);

      if (!success || !data) {
        return;
      }

      const latest = journeyRef.current;

      if (!latest || latest.id !== current.id) {
        return;
      }

      commitJourney({ ...latest, checkins: [...latest.checkins, data] });

      if ('vibrate' in navigator) {
        navigator.vibrate(CHECKIN_VIBRATION_MS);
      }

      onCheckin(review);
    },
    [commitJourney, onCheckin]
  );

  const handlePosition = useCallback(
    (position: GeolocationPosition) => {
      onPosition(position);

      const current = journeyRef.current;

      if (!uid || !current?.started_at) {
        return;
      }

      lastPositionAtRef.current = position.timestamp;

      const here = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      const previousFix = lastFixRef.current;
      lastFixRef.current = { ...here, timestamp: position.timestamp };

      const { accuracy } = position.coords;
      const precise = accuracy <= CHECKIN_MAX_ACCURACY_METERS;
      const anchor = anchorRef.current;

      const applyStationary = (next: boolean) => {
        stationaryRef.current = next;
        setStationary(next);
      };

      if (
        anchor &&
        distanceInMeters(here, anchor) >
          Math.max(STATIONARY_RADIUS_METERS, accuracy, anchor.accuracy)
      ) {
        // The fix's error circle excludes the anchor, so this is genuine
        // movement even when the fix itself is coarse.
        anchorRef.current = precise
          ? { ...here, accuracy, since: position.timestamp }
          : null;
        applyStationary(false);
      } else if (!anchor) {
        // Only a precise fix may open an anchor: a coarse one would widen the
        // stillness radius so far that a stroll would read as rest.
        if (precise) {
          anchorRef.current = { ...here, accuracy, since: position.timestamp };
        }
        applyStationary(false);
      } else if (precise) {
        applyStationary(
          position.timestamp - anchor.since >= STATIONARY_AFTER_MS
        );
      }

      const lastPoint = trailRef.current.at(-1);

      // A coarse fix drifts on its own, so the threshold follows the reported
      // accuracy to keep those jumps out of the trail.
      const minDistance = Math.max(
        PATH_MIN_DISTANCE_METERS,
        position.coords.accuracy
      );

      if (!lastPoint || distanceInMeters(here, lastPoint) >= minDistance) {
        commitTrail([...trailRef.current, here]);
      }

      const visitedIds = new Set(
        current.checkins.map((checkin) => checkin.review_id)
      );

      const remaining = reviewsRef.current.filter(
        (review) => !visitedIds.has(review.id)
      );

      const nearest = remaining.reduce(
        (shortest, review) =>
          Math.min(shortest, distanceInMeters(here, review)),
        Number.POSITIVE_INFINITY
      );

      setHighAccuracy((enabled) =>
        enabled
          ? nearest <= ACCURACY_DOWNGRADE_RADIUS_METERS
          : nearest <= ACCURACY_UPGRADE_RADIUS_METERS
      );

      const currentAnchor = anchorRef.current;

      if (stationaryRef.current && currentAnchor) {
        const steps = Math.min(
          STATIONARY_BACKOFF_MAX_STEPS,
          Math.floor(
            (position.timestamp - currentAnchor.since) / STATIONARY_AFTER_MS
          )
        );

        const cap =
          nearest <= ACCURACY_DOWNGRADE_RADIUS_METERS
            ? STATIONARY_SAMPLE_MAX_NEAR_MS
            : STATIONARY_SAMPLE_MAX_FAR_MS;

        sampleIntervalRef.current = Math.min(
          cap,
          STATIONARY_SAMPLE_BASE_INTERVAL_MS * 2 ** steps
        );
      } else {
        let observedSpeed = position.coords.speed ?? Number.NaN;

        if (!Number.isFinite(observedSpeed) || observedSpeed < 0) {
          observedSpeed =
            previousFix && position.timestamp > previousFix.timestamp
              ? distanceInMeters(here, previousFix) /
                ((position.timestamp - previousFix.timestamp) / 1000)
              : 0;
        }

        const speed = Math.max(
          MIN_ASSUMED_SPEED_MPS,
          observedSpeed * SPEED_HEADROOM
        );

        // The next sample only has to land before the traveller could reach
        // the continuous-watch zone around the nearest unvisited spot.
        const travelMs =
          ((nearest - ACCURACY_UPGRADE_RADIUS_METERS) / speed) * 1000;

        sampleIntervalRef.current = Math.min(
          MOVING_SAMPLE_MAX_INTERVAL_MS,
          Math.max(MOVING_SAMPLE_MIN_INTERVAL_MS, travelMs)
        );
      }

      if (position.coords.accuracy > CHECKIN_MAX_ACCURACY_METERS) {
        return;
      }

      const reached = remaining.filter(
        (review) =>
          !pendingCheckinsRef.current.has(review.id) &&
          distanceInMeters(here, review) <= CHECKIN_RADIUS_METERS
      );

      for (const review of reached) {
        performCheckin(review);
      }
    },
    [uid, onPosition, commitTrail, performCheckin]
  );

  // Losing the permission mid-journey must not cost the traveller their
  // milestones and check-ins, so recording only pauses.
  const handleError = useCallback(
    (error: GeolocationPositionError) => {
      // The watch stays live until the effect cleanup runs, so a second
      // error can arrive before it is torn down. The ref settles at once
      // where the state would not.
      if (pausedRef.current || error.code !== error.PERMISSION_DENIED) {
        return;
      }

      commitPaused(true);
      onPaused('permission');
    },
    [commitPaused, onPaused]
  );

  const recording = Boolean(
    canRecord && journey?.started_at && !journey.finished_at && !paused
  );

  const watching = recording && visible;

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === 'visible');

    sync();
    document.addEventListener('visibilitychange', sync);

    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  // A journey left running overnight would keep the device fixing positions
  // for nothing, so a long gap without a fix stops it until the traveller
  // sets off again.
  useEffect(() => {
    if (!visible || !recording) {
      return;
    }

    const check = () => {
      const lastPositionAt = lastPositionAtRef.current;

      if (
        lastPositionAt &&
        Date.now() - lastPositionAt >= INACTIVITY_PAUSE_MS
      ) {
        commitPaused(true);
        onPaused('inactivity');
      }
    };

    check();

    const intervalId = setInterval(check, INACTIVITY_CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [visible, recording, commitPaused, onPaused]);

  useEffect(() => {
    if (!uid || !watching) {
      return;
    }

    if (!('geolocation' in navigator)) {
      onLocationError();
      return;
    }

    // Only a moving traveller near an unvisited spot needs the fix rate a
    // continuous watch provides; everywhere else timed samples are enough.
    if (highAccuracy && !stationary) {
      const watchId = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        HIGH_ACCURACY_OPTIONS
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const options: PositionOptions = {
      ...(highAccuracy ? HIGH_ACCURACY_OPTIONS : LOW_ACCURACY_OPTIONS),
      timeout: SAMPLE_TIMEOUT_MS
    };

    const schedule = () => {
      timeoutId = setTimeout(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!cancelled) {
              handlePosition(position);
              schedule();
            }
          },
          (error) => {
            if (!cancelled) {
              handleError(error);
              schedule();
            }
          },
          options
        );
      }, sampleIntervalRef.current);
    };

    // The fix that switched the journey into sampling mode has just been
    // handled, so the first sample can wait a full interval.
    schedule();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    uid,
    watching,
    highAccuracy,
    stationary,
    handlePosition,
    handleError,
    onLocationError
  ]);

  const requestPosition =
    useCallback((): Promise<GeolocationPosition | null> => {
      if (!('geolocation' in navigator)) {
        return Promise.resolve(null);
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (fix) => resolve(fix),
          () => resolve(null),
          { ...HIGH_ACCURACY_OPTIONS, timeout: INITIAL_POSITION_TIMEOUT_MS }
        );
      });
    }, []);

  const pause = () => commitPaused(true);

  // Asking here rather than letting the watch ask keeps a refused resume from
  // reporting success and bouncing straight back to paused.
  const resume = async (): Promise<boolean> => {
    const position = await requestPosition();

    if (!position) {
      return false;
    }

    commitPaused(false);
    handlePosition(position);

    return true;
  };

  const ensureJourney = useCallback(async (): Promise<Journey | null> => {
    const current = journeyRef.current;

    if (current) {
      return current;
    }

    const { success, data, error } = await initJourney(map.id);

    if (!success || !data) {
      onError(error);
      return null;
    }

    commitJourney(data);

    return data;
  }, [map.id, commitJourney, onError]);

  const addMilestone = async (review: Review): Promise<boolean> => {
    if (!authenticated || !uid) {
      setSignInRequired(true);
      return false;
    }

    const current = await ensureJourney();

    if (!current) {
      return false;
    }

    if (
      current.milestones.some((existing) => existing.review_id === review.id)
    ) {
      return true;
    }

    const { success, data, error } = await addMilestoneAction(
      current.id,
      review.id
    );

    if (!success || !data) {
      onError(error);
      return false;
    }

    const latest = journeyRef.current;

    if (!latest || latest.id !== current.id) {
      return false;
    }

    commitJourney({ ...latest, milestones: [...latest.milestones, data] });
    return true;
  };

  // The permission prompt belongs to this tap rather than to the watch that
  // follows, so a refused journey never reaches the started state.
  const start = async (): Promise<boolean> => {
    if (!uid) {
      return false;
    }

    const position = await requestPosition();

    if (!position) {
      onLocationError();
      return false;
    }

    const current = await ensureJourney();

    if (!current) {
      return false;
    }

    const { success, data, error } = await startJourney(current.id);

    if (success && data) {
      commitJourney(data);
      commitPaused(false);
      handlePosition(position);
      return true;
    }

    onError(error);
    return false;
  };

  const removeMilestone = async (milestone: Milestone) => {
    const current = journeyRef.current;

    if (!uid || !current) {
      return;
    }

    const { success, error } = await removeMilestoneAction(
      current.id,
      milestone.id
    );

    if (!success) {
      onError(error);
      return;
    }

    const latest = journeyRef.current;

    if (!latest || latest.id !== current.id) {
      return;
    }

    const milestones = latest.milestones.filter(
      (existing) => existing.id !== milestone.id
    );

    if (
      !latest.started_at &&
      milestones.length < 1 &&
      latest.checkins.length < 1
    ) {
      deleteJourney(latest.id);
      commitJourney(null);
      return;
    }

    commitJourney({ ...latest, milestones });
  };

  const removeCheckin = async (target: JourneyCheckin) => {
    const current = journeyRef.current;

    if (!uid || !current) {
      return;
    }

    const { success, error } = await removeCheckinAction(current.id, target.id);

    if (!success) {
      onError(error);
      return;
    }

    const latest = journeyRef.current;

    if (!latest || latest.id !== current.id) {
      return;
    }

    commitJourney({
      ...latest,
      checkins: latest.checkins.filter((checkin) => checkin.id !== target.id)
    });
  };

  const end = async (): Promise<FinishedJourney | null> => {
    const current = journeyRef.current;

    if (!uid || !current) {
      return null;
    }

    const points = trailRef.current;
    const { success, data, error } = await finishJourney(
      current.id,
      encodePath(points)
    );

    if (!success || !data) {
      onError(error);
      return null;
    }

    deleteTrail(uid, current.id);
    deletePaused(uid, current.id);
    commitJourney(null);
    trailRef.current = [];
    setTrail([]);
    pausedRef.current = false;
    setPaused(false);
    lastFixRef.current = null;
    anchorRef.current = null;
    stationaryRef.current = false;
    setStationary(false);
    sampleIntervalRef.current = MOVING_SAMPLE_MIN_INTERVAL_MS;

    return { journey: data, trail: points };
  };

  return {
    journey,
    trail,
    paused,
    addMilestone,
    start,
    end,
    pause,
    resume,
    removeMilestone,
    removeCheckin,
    attachCheckinImage,
    removeCheckinImage,
    updateCheckinNote
  };
}
