import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_LOCALE,
  isLocale,
  localePath,
  preferredLocale,
  toLocale
} from './locales.ts';

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

describe('preferredLocale', () => {
  it('picks the first supported language in order', () => {
    assert.equal(preferredLocale('fr-FR,ja;q=0.9,en;q=0.8'), 'ja');
    assert.equal(preferredLocale('en-US,ja;q=0.9'), 'en');
  });

  it('prefers the higher weight over the listed order', () => {
    assert.equal(preferredLocale('en;q=0.5,ja;q=0.9'), 'ja');
  });

  it('never picks a language the reader refused', () => {
    assert.equal(preferredLocale('ja;q=0,en;q=1'), 'en');
    assert.equal(preferredLocale('ja;q=0'), DEFAULT_LOCALE);
  });

  it('matches regional variants case-insensitively', () => {
    assert.equal(preferredLocale('JA-jp'), 'ja');
  });

  it('falls back to the default locale', () => {
    assert.equal(preferredLocale('fr,de'), DEFAULT_LOCALE);
    assert.equal(preferredLocale(''), DEFAULT_LOCALE);
    assert.equal(preferredLocale(null), DEFAULT_LOCALE);
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
