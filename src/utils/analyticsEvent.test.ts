import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { toDataPoint } from './analyticsEvent.ts';

describe('toDataPoint', () => {
  it('indexes the event by name and places each parameter in its column', () => {
    assert.deepEqual(
      toDataPoint({
        name: 'like',
        params: { content_type: 'comment', item_id: 42 }
      }),
      {
        indexes: ['like'],
        blobs: ['like', 'comment'],
        doubles: [42, 0, 0]
      }
    );
    assert.deepEqual(
      toDataPoint({ name: 'publish_chapter', params: { chapter_id: 7 } }),
      {
        indexes: ['publish_chapter'],
        blobs: ['publish_chapter', ''],
        doubles: [0, 0, 7]
      }
    );
  });

  it('records a journey without a map as map 0', () => {
    assert.deepEqual(
      toDataPoint({ name: 'start_journey', params: { map_id: null } }),
      {
        indexes: ['start_journey'],
        blobs: ['start_journey', ''],
        doubles: [0, 0, 0]
      }
    );
    assert.deepEqual(
      toDataPoint({ name: 'finish_journey', params: { map_id: 3 } }).doubles,
      [0, 3, 0]
    );
  });
});
