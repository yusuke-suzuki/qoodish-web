import type { Journey, JourneySummary } from '../../types/index.ts';
import { apiFetch, apiFetchList, assertApiAvailable } from './api.ts';

export function getMyJourneys(
  lang: string,
  token?: string
): Promise<JourneySummary[]> {
  if (!token) {
    return Promise.resolve([]);
  }

  return apiFetchList<JourneySummary>('/me/journeys', {
    lang,
    next: { revalidate: 0 }
  });
}

export async function getMyJourney(
  journeyId: string,
  lang: string,
  token?: string
): Promise<Journey | null> {
  if (!token) {
    return null;
  }

  const path = `/me/journeys/${journeyId}`;
  const { data, status } = await apiFetch<Journey>(path, {
    lang,
    next: { revalidate: 0 }
  });
  assertApiAvailable(status, path);
  return data;
}
