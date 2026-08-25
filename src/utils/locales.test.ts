import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_LOCALE, isLocale, localePath, toLocale } from './locales';

describe('isLocale', () => {
  it('accepts every supported locale', () => {
    assert.equal(isLocale('en'), true);
    assert.equal(isLocale('ja'), true);
  });

  it('rejects unsupported values', () => {
    assert.equal(isLocale('fr'), false);
    assert.equal(isLocale('EN'), false);
    assert.equal(isLocale(''), false);
    assert.equal(isLocale(null), false);
    assert.equal(isLocale(undefined), false);
  });
});

describe('toLocale', () => {
  it('passes supported locales through', () => {
    assert.equal(toLocale('ja'), 'ja');
  });

  it('falls back to the default locale', () => {
    assert.equal(toLocale('fr'), DEFAULT_LOCALE);
    assert.equal(toLocale(null), DEFAULT_LOCALE);
    assert.equal(toLocale(undefined), DEFAULT_LOCALE);
  });
});

describe('localePath', () => {
  it('prefixes the path with the locale', () => {
    assert.equal(localePath('ja', '/maps/1'), '/ja/maps/1');
  });

  it('treats the root path as the bare locale', () => {
    assert.equal(localePath('ja', '/'), '/ja');
    assert.equal(localePath('ja'), '/ja');
  });

  it('normalizes unsupported locales to the default', () => {
    assert.equal(localePath('fr', '/maps/1'), '/en/maps/1');
  });
});
