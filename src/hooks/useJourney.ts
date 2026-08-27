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
} from '../../types/index.ts';
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
} from '../actions/journeys.ts';
import AuthContext from '../context/AuthContext.ts';
import {
  deletePaused,
  loadPaused,
  savePaused
} from '../utils/journeyPauseStorage.ts';
import {
  MOVING_SAMPLE_MIN_INTERVAL_MS,
  nextHighAccuracy,
  type PreviousFix,
  type StationaryAnchor,
  type TrackingFix,
  trackPosition
} from '../utils/journeyTracking.ts';
import {
  deleteTrail,
  loadTrail,
  saveTrail
} from '../utils/journeyTrailStorage.ts';
import { encodePath } from '../utils/polyline.ts';
import useLatestCallback from './useLatestCallback.ts';

const CHECKIN_VIBRATION_MS = 30;

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

// A fix that never resolves would otherwise stall the sampling loop.
const SAMPLE_TIMEOUT_MS = 30000;

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
  const lastFixRef = useRef<PreviousFix | null>(null);
  const sampleIntervalRef = useRef(MOVING_SAMPLE_MIN_INTERVAL_MS);
  const lastPositionAtRef = useRef<number | null>(null);

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

  const processPosition = (position: GeolocationPosition) => {
    onPosition(position);

    const current = journeyRef.current;

    if (!uid || !current?.started_at) {
      return;
    }

    lastPositionAtRef.current = position.timestamp;

    const fix: TrackingFix = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed,
      timestamp: position.timestamp
    };

    const visitedIds = new Set(
      current.checkins.map((checkin) => checkin.review_id)
    );

    const decision = trackPosition(
      {
        anchor: anchorRef.current,
        stationary: stationaryRef.current,
        previousFix: lastFixRef.current,
        lastTrailPoint: trailRef.current.at(-1) ?? null
      },
      fix,
      reviews.filter((review) => !visitedIds.has(review.id))
    );

    lastFixRef.current = {
      latitude: fix.latitude,
      longitude: fix.longitude,
      timestamp: fix.timestamp
    };

    anchorRef.current = decision.anchor;
    stationaryRef.current = decision.stationary;
    setStationary(decision.stationary);
    sampleIntervalRef.current = decision.sampleIntervalMs;

    if (decision.extendTrail) {
      commitTrail([
        ...trailRef.current,
        { latitude: fix.latitude, longitude: fix.longitude }
      ]);
    }

    setHighAccuracy((enabled) =>
      nextHighAccuracy(enabled, decision.nearestMeters)
    );

    for (const review of decision.reached) {
      performCheckin(review);
    }
  };

  // The geolocation watch and the sampling timer outlive the render that
  // registered them, so they deliver fixes through the latest committed
  // closure, which sees the newest review list without the watch having to
  // re-register every time that list changes. Event handlers call
  // processPosition directly.
  const handlePosition = useLatestCallback(processPosition);

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
        (position) => handlePosition(position),
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
    processPosition(position);

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
      processPosition(position);
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
