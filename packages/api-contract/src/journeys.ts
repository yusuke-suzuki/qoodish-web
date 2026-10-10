import type { Image } from './images.ts';
import type { MapRef } from './maps.ts';
import type { IsoTimestamp } from './scalars.ts';

export type Spot = {
  name: string;
  latitude: number;
  longitude: number;
};

export type Milestone = Spot & {
  id: number;
  pin_id: number | null;
};

export type JourneyCheckin = {
  id: number;
  pin_id: number | null;
  spot: Spot;
  note: string | null;
  images: Image[];
  checked_in_at: IsoTimestamp;
};

type JourneyAttributes = {
  id: number;
  map_id: number | null;
  started_at: IsoTimestamp | null;
  finished_at: IsoTimestamp | null;
  chapter_id: number | null;
  map: MapRef | null;
  created_at: IsoTimestamp;
  updated_at: IsoTimestamp;
};

export type Journey = JourneyAttributes & {
  milestones: Milestone[];
  checkins: JourneyCheckin[];
  encoded_path: string | null;
};

export type JourneySummary = JourneyAttributes & {
  milestones_count: number;
  checkins_count: number;
};
