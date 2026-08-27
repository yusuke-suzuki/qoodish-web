import type { Journey, JourneySummary } from '../../types/index.ts';
import { apiFetch } from './api.ts';

export async function getMyJourneys(
  lang: string,
  token?: string
): Promise<JourneySummary[]> {
  if (!token) {
    return [];
  }

  const { data } = await apiFetch<JourneySummary[]>('/me/journeys', {
    lang,
    next: { revalidate: 0 }
  });
  return data ?? [];
}

export async function getMyJourney(
  journeyId: string,
  lang: string,
  token?: string
): Promise<Journey | null> {
  if (!token) {
    return null;
  }

  const { data } = await apiFetch<Journey>(`/me/journeys/${journeyId}`, {
    lang,
    next: { revalidate: 0 }
  });
  return data;
}
