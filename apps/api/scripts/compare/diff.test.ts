import { describe, expect, it } from 'vitest';
import {
  compare,
  comparisonFor,
  differences,
  keyOrderDifferences
} from './diff.ts';

describe('differences', () => {
  it('finds nothing in equal documents, whatever the number formatting', () => {
    expect(
      differences(
        JSON.parse('{"a":[1,{"b":35.0}]}'),
        JSON.parse('{"a":[1,{"b":35}]}')
      )
    ).toEqual([]);
  });

  it('points at the value that differs', () => {
    expect(differences({ a: [{ b: 1 }] }, { a: [{ b: 2 }] })).toEqual([
      { path: '$.a[0].b', rails: 1, worker: 2 }
    ]);
  });

  it('reports missing keys and lengths', () => {
    expect(differences({ a: 1, list: [1, 2] }, { b: 1, list: [1] })).toEqual([
      { path: '$.a', rails: 1, worker: undefined },
      { path: '$.list.length', rails: 2, worker: 1 },
      { path: '$.b', rails: undefined, worker: 1 }
    ]);
  });

  it('tells null apart from a missing value', () => {
    expect(differences({ a: null }, { a: undefined })).toEqual([
      { path: '$.a', rails: null, worker: undefined }
    ]);
  });
});

describe('keyOrderDifferences', () => {
  it('lists the objects whose keys come in another order', () => {
    expect(
      keyOrderDifferences(
        { a: 1, b: { c: 1, d: 2 } },
        { a: 1, b: { d: 2, c: 1 } }
      )
    ).toEqual(['$.b']);
  });
});

describe('compare', () => {
  it('compares rankings and searches as sets of ids', () => {
    expect(comparisonFor('/guest/maps?popular=true')).toBe('unordered');
    expect(comparisonFor('/guest/pins?input=ramen')).toBe('unordered');
    expect(comparisonFor('/guest/maps?recommend=true')).toBe('status');
    expect(comparisonFor('/guest/maps/1')).toBe('exact');

    expect(
      compare(
        '/guest/maps?popular=true',
        [{ id: 1 }, { id: 2 }],
        [{ id: 2 }, { id: 1 }]
      )
    ).toEqual({ differences: [], reordered: true });
  });

  it('keeps the order of everything else significant', () => {
    expect(
      compare(
        '/guest/v2/pins',
        { data: [{ id: 1 }, { id: 2 }] },
        { data: [{ id: 2 }, { id: 1 }] }
      ).differences
    ).toHaveLength(2);
  });
});
