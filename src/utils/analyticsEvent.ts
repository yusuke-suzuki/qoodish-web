export type AnalyticsEvent =
  | {
      name: 'create_map' | 'create_pin' | 'create_chapter';
      params: { map_id: number };
    }
  | { name: 'publish_chapter'; params: { chapter_id: number } }
  | {
      name: 'start_journey' | 'finish_journey';
      params: { map_id: number | null };
    }
  | {
      name: 'add_comment';
      params: { content_type: 'pin' | 'chapter'; item_id: number };
    }
  | {
      name: 'like';
      params: { content_type: 'pin' | 'chapter' | 'comment'; item_id: number };
    }
  | {
      name: 'follow';
      params: { content_type: 'map' | 'journal'; item_id: number };
    };

export type AnalyticsDataPoint = {
  indexes: [string];
  blobs: [string, string];
  doubles: [number, number, number];
};

export function toDataPoint({
  name,
  params
}: AnalyticsEvent): AnalyticsDataPoint {
  return {
    indexes: [name],
    blobs: [name, 'content_type' in params ? params.content_type : ''],
    doubles: [
      'item_id' in params ? params.item_id : 0,
      'map_id' in params ? (params.map_id ?? 0) : 0,
      'chapter_id' in params ? params.chapter_id : 0
    ]
  };
}
