import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import en from '../dictionaries/en.json' with { type: 'json' };
import ja from '../dictionaries/ja.json' with { type: 'json' };
import { countLabel } from './countLabel.ts';

describe('countLabel', () => {
  it('uses the singular for one in English', () => {
    assert.equal(countLabel('en', en, 'comment count', 1), '1 comment');
  });

  it('uses the plural for every other number in English', () => {
    assert.equal(countLabel('en', en, 'comment count', 0), '0 comments');
    assert.equal(countLabel('en', en, 'comment count', 2), '2 comments');
  });

  it('uses the single Japanese form for any number', () => {
    assert.equal(countLabel('ja', ja, 'comment count', 1), '1件のコメント');
    assert.equal(countLabel('ja', ja, 'comment count', 2), '2件のコメント');
  });

  it('falls back to the plural form for an unknown locale', () => {
    assert.equal(countLabel('fr', en, 'comment count', 3), '3 comments');
  });

  it('labels chapters as well as comments', () => {
    assert.equal(countLabel('en', en, 'chapters count', 1), '1 chapter');
    assert.equal(countLabel('en', en, 'chapters count', 4), '4 chapters');
    assert.equal(countLabel('ja', ja, 'chapters count', 4), '4件のチャプター');
  });
});
