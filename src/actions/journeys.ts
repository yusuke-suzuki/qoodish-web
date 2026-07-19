'use server';

import type { Journey, JourneyCheckin, Milestone } from '../../types';
import { apiFetch } from '../lib/api';

type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function initJourney(
  mapId: number
): Promise<ActionResult<Journey>> {
  const { data, error } = await apiFetch<Journey>(`/maps/${mapId}/journeys`, {
    method: 'POST'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function startJourney(
  journeyId: number
): Promise<ActionResult<Journey>> {
  const { data, error } = await apiFetch<Journey>(
    `/me/journeys/${journeyId}/start`,
    {
      method: 'POST'
    }
  );

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function finishJourney(
  journeyId: number,
  encodedPath: string
): Promise<ActionResult<Journey>> {
  const { data, error } = await apiFetch<Journey>(
    `/me/journeys/${journeyId}/finish`,
    {
      method: 'POST',
      body: JSON.stringify({ encoded_path: encodedPath })
    }
  );

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function deleteJourney(journeyId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/me/journeys/${journeyId}`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function addMilestone(
  journeyId: number,
  reviewId: number
): Promise<ActionResult<Milestone>> {
  const { data, error } = await apiFetch<Milestone>(
    `/me/journeys/${journeyId}/milestones`,
    {
      method: 'POST',
      body: JSON.stringify({ review_id: reviewId })
    }
  );

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function removeMilestone(
  journeyId: number,
  milestoneId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(
    `/me/journeys/${journeyId}/milestones/${milestoneId}`,
    {
      method: 'DELETE'
    }
  );

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function addCheckin(
  journeyId: number,
  reviewId: number
): Promise<ActionResult<JourneyCheckin>> {
  const { data, error } = await apiFetch<JourneyCheckin>(
    `/me/journeys/${journeyId}/checkins`,
    {
      method: 'POST',
      body: JSON.stringify({ review_id: reviewId })
    }
  );

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function updateCheckin(
  journeyId: number,
  checkinId: number,
  imageIds: number[]
): Promise<ActionResult<JourneyCheckin>> {
  const { data, error } = await apiFetch<JourneyCheckin>(
    `/me/journeys/${journeyId}/checkins/${checkinId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ image_ids: imageIds })
    }
  );

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function removeCheckin(
  journeyId: number,
  checkinId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(
    `/me/journeys/${journeyId}/checkins/${checkinId}`,
    {
      method: 'DELETE'
    }
  );

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
