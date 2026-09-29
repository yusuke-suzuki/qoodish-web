import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { toDataPoint } from './analyticsEvent.ts';

describe('toDataPoint', () => {
  it('maps an event with every kind of parameter to its data point', () => {
    assert.deepEqual(
      toDataPoint({
        name: 'share',
        params: { method: 'copy_link', content_type: 'pin', item_id: 42 }
      }),
      {
        indexes: ['share'],
        blobs: ['share', 'pin', 'copy_link', ''],
        doubles: [42, 0, 0]
      }
    );
  });

  it('accepts an event without parameters', () => {
    assert.deepEqual(toDataPoint({ name: 'email_link_sent' }), {
      indexes: ['email_link_sent'],
      blobs: ['email_link_sent', '', '', ''],
      doubles: [0, 0, 0]
    });
  });

  it('rejects an unknown event name', () => {
    assert.equal(toDataPoint({ name: 'page_view' }), null);
  });

  it('rejects an unknown parameter', () => {
    assert.equal(
      toDataPoint({ name: 'create_map', params: { map_id: 1, email: 'a' } }),
      null
    );
  });

  it('rejects a string parameter outside its allowed values', () => {
    assert.equal(
      toDataPoint({ name: 'login', params: { method: 'password' } }),
      null
    );
    assert.equal(
      toDataPoint({
        name: 'link_provider',
        params: { provider: 'a'.repeat(33) }
      }),
      null
    );
  });

  it('rejects an identifier that is not a positive safe integer', () => {
    for (const map_id of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, '1']) {
      assert.equal(
        toDataPoint({ name: 'create_map', params: { map_id } }),
        null
      );
    }
  });

  it('rejects a payload that is not an object', () => {
    assert.equal(toDataPoint(null), null);
    assert.equal(toDataPoint('login'), null);
    assert.equal(toDataPoint({ name: 'login', params: [] }), null);
  });
});
