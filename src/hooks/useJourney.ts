'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type {
  AppMap,
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
  startJourney
} from '../actions/journeys';
import AuthContext from '../context/AuthContext';
import { distanceInMeters } from '../utils/geo';
import {
  deleteTrail,
  loadTrail,
  saveTrail
} from '../utils/journeyTrailStorage';
import { encodePath } from '../utils/polyline';

const CHECKIN_RADIUS_METERS = 50;
const PATH_MIN_DISTANCE_METERS = 10;

type Args = {
  map: AppMap;
  reviews: Review[];
  initialJourney: Journey | null;
  onCheckin: (review: Review) => void;
  onPosition: (position: GeolocationPosition) => void;
  onLocationError: () => void;
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
  onCheckin,
  onPosition,
  onLocationError,
  onError
}: Args) {
  const { uid, isLoading, authenticated, setSignInRequired } =
    useContext(AuthContext);

  const [journey, setJourney] = useState<Journey | null>(initialJourney);
  const journeyRef = useRef<Journey | null>(initialJourney);

  const trailRef = useRef<JourneyPathPoint[]>([]);
  const [trail, setTrail] = useState<JourneyPathPoint[]>([]);

  const reviewsRef = useRef(reviews);
  reviewsRef.current = reviews;

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

  useEffect(() => {
    if (isLoading || !uid) {
      return;
    }

    const current = journeyRef.current;

    if (current?.started_at && !current.finished_at) {
      const stored = loadTrail(uid, current.id);
      trailRef.current = stored;
      setTrail(stored);
    }
  }, [uid, isLoading]);

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
      onCheckin(review);
    },
    [commitJourney, onCheckin]
  );

  const handlePosition = useCallback(
    (position: GeolocationPosition) => {
      onPosition(position);

      const current = journeyRef.current;

      if (!uid || !current || !current.started_at) {
        return;
      }

      const here = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      const lastPoint = trailRef.current[trailRef.current.length - 1];

      if (
        !lastPoint ||
        distanceInMeters(here, lastPoint) >= PATH_MIN_DISTANCE_METERS
      ) {
        commitTrail([...trailRef.current, here]);
      }

      const visitedIds = new Set(
        current.checkins.map((checkin) => checkin.review_id)
      );

      const reached = reviewsRef.current.filter(
        (review) =>
          !visitedIds.has(review.id) &&
          !pendingCheckinsRef.current.has(review.id) &&
          distanceInMeters(here, review) <= CHECKIN_RADIUS_METERS
      );

      for (const review of reached) {
        performCheckin(review);
      }
    },
    [uid, onPosition, commitTrail, performCheckin]
  );

  const handleError = useCallback(
    (error: GeolocationPositionError) => {
      if (error.code !== error.PERMISSION_DENIED) {
        return;
      }

      const current = journeyRef.current;

      if (uid && current) {
        deleteTrail(uid, current.id);
        deleteJourney(current.id);
      }

      commitJourney(null);
      onLocationError();
    },
    [uid, onLocationError, commitJourney]
  );

  const watching = Boolean(journey?.started_at && !journey.finished_at);

  useEffect(() => {
    if (!uid || !watching) {
      return;
    }

    if (!('geolocation' in navigator)) {
      onLocationError();
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 10000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [uid, watching, handlePosition, handleError, onLocationError]);

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

  const addMilestone = useCallback(
    async (review: Review): Promise<boolean> => {
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
    },
    [
      authenticated,
      uid,
      setSignInRequired,
      ensureJourney,
      commitJourney,
      onError
    ]
  );

  const start = useCallback(async (): Promise<boolean> => {
    if (!uid) {
      return false;
    }

    if (!('geolocation' in navigator)) {
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
      return true;
    }

    onError(error);
    return false;
  }, [uid, ensureJourney, commitJourney, onLocationError, onError]);

  const removeMilestone = useCallback(
    async (milestone: Milestone) => {
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
    },
    [uid, commitJourney, onError]
  );

  const removeCheckin = useCallback(
    async (target: JourneyCheckin) => {
      const current = journeyRef.current;

      if (!uid || !current) {
        return;
      }

      const { success, error } = await removeCheckinAction(
        current.id,
        target.id
      );

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
    },
    [uid, commitJourney, onError]
  );

  const end = useCallback(async (): Promise<FinishedJourney | null> => {
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
    commitJourney(null);
    trailRef.current = [];
    setTrail([]);

    return { journey: data, trail: points };
  }, [uid, commitJourney, onError]);

  return {
    journey,
    trail,
    addMilestone,
    start,
    end,
    removeMilestone,
    removeCheckin
  };
}
