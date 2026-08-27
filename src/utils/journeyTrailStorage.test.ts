import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  installLocalStorage,
  memoryStorage,
  throwingStorage
} from '../test/localStorage.ts';
import { deleteTrail, loadTrail, saveTrail } from './journeyTrailStorage.ts';

const TRAIL = [
  { latitude: 35.6586, longitude: 139.7454 },
  { latitude: 35.659, longitude: 139.746 }
];

describe('journeyTrailStorage', () => {
  let storage: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    storage = memoryStorage();
    installLocalStorage(storage);
  });

  it('round-trips a trail per user and journey', () => {
    saveTrail('user-1', 1, TRAIL);

    assert.deepEqual(loadTrail('user-1', 1), TRAIL);
    assert.deepEqual(loadTrail('user-1', 2), []);
    assert.deepEqual(loadTrail('user-2', 1), []);
  });

  it('stores under the versioned key existing trails rely on', () => {
    saveTrail('user-1', 1, TRAIL);

    assert.ok(storage.store.has('qoodish.journeyTrail.v1:user-1:1'));
  });

  it('returns an empty trail when nothing is stored', () => {
    assert.deepEqual(loadTrail('user-1', 1), []);
  });

  it('recovers from a corrupted entry', () => {
    storage.store.set('qoodish.journeyTrail.v1:user-1:1', '{not json');

    assert.deepEqual(loadTrail('user-1', 1), []);
  });

  it('deletes only the addressed trail', () => {
    saveTrail('user-1', 1, TRAIL);
    saveTrail('user-1', 2, TRAIL);

    deleteTrail('user-1', 1);

    assert.deepEqual(loadTrail('user-1', 1), []);
    assert.deepEqual(loadTrail('user-1', 2), TRAIL);
  });

  it('degrades silently when storage access is denied', () => {
    installLocalStorage(throwingStorage());

    assert.deepEqual(loadTrail('user-1', 1), []);
    assert.doesNotThrow(() => saveTrail('user-1', 1, TRAIL));
    assert.doesNotThrow(() => deleteTrail('user-1', 1));
  });
});
