import type { Journey, JourneyCheckin } from '../../types/index.ts';

export function buildCheckin(
  id: number,
  checkedInAt: string,
  overrides: Partial<JourneyCheckin> = {}
): JourneyCheckin {
  return {
    id,
    review_id: id * 100,
    spot: { name: `Spot ${id}`, latitude: 35, longitude: 139 },
    checked_in_at: checkedInAt,
    note: null,
    images: [],
    ...overrides
  };
}

export function buildJourney(checkins: JourneyCheckin[]): Journey {
  return {
    id: 1,
    map_id: 10,
    started_at: '2026-08-01T00:00:00Z',
    finished_at: null,
    milestones: [],
    checkins,
    encoded_path: null,
    chapter_id: null,
    map: null,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  };
}
