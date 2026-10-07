import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  installLocalStorage,
  memoryStorage,
  throwingStorage
} from '../test/localStorage.ts';
import { deletePaused, loadPaused, savePaused } from './journeyPauseStorage.ts';

describe('journeyPauseStorage', () => {
  let storage: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    storage = memoryStorage();
    installLocalStorage(storage);
  });

  it('defaults to not paused', () => {
    assert.equal(loadPaused('user-1', 1), false);
  });

  it('round-trips the paused flag per user and journey', () => {
    savePaused('user-1', 1, true);

    assert.equal(loadPaused('user-1', 1), true);
    assert.equal(loadPaused('user-1', 2), false);
    assert.equal(loadPaused('user-2', 1), false);
  });

  it('stores under the versioned key existing pauses rely on', () => {
    savePaused('user-1', 1, true);

    assert.ok(storage.store.has('qoodish.journeyPaused.v1:user-1:1'));
  });

  it('clears the flag when saving an unpaused state', () => {
    savePaused('user-1', 1, true);
    savePaused('user-1', 1, false);

    assert.equal(loadPaused('user-1', 1), false);
    assert.equal(storage.store.size, 0);
  });

  it('deletes the stored flag', () => {
    savePaused('user-1', 1, true);
    deletePaused('user-1', 1);

    assert.equal(loadPaused('user-1', 1), false);
  });

  it('degrades silently when storage access is denied', () => {
    installLocalStorage(throwingStorage());

    assert.equal(loadPaused('user-1', 1), false);
    assert.doesNotThrow(() => savePaused('user-1', 1, true));
    assert.doesNotThrow(() => deletePaused('user-1', 1));
  });
});
