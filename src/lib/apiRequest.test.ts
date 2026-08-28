import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildApiHeaders, parseAcceptLanguage } from './apiRequest.ts';

describe('parseAcceptLanguage', () => {
  it('keeps the first language of a weighted list', () => {
    assert.equal(parseAcceptLanguage('ja,en-US;q=0.9,en;q=0.8'), 'ja');
  });

  it('prefers the heaviest language over the first one', () => {
    assert.equal(parseAcceptLanguage('en;q=0.5,ja'), 'ja');
  });

  it('leaves the weight off the language it picks', () => {
    assert.equal(parseAcceptLanguage('en-US;q=0.9'), 'en-US');
  });

  it('ignores a language the reader refuses', () => {
    assert.equal(parseAcceptLanguage('ja;q=0,en'), 'en');
    assert.equal(parseAcceptLanguage('ja;Q=0,en'), 'en');
  });

  it('names no locale for a wildcard', () => {
    assert.equal(parseAcceptLanguage('*'), 'en');
  });

  it('falls back to English without a usable header', () => {
    assert.equal(parseAcceptLanguage(null), 'en');
    assert.equal(parseAcceptLanguage(''), 'en');
  });
});

describe('buildApiHeaders', () => {
  it('omits the authorization header for a guest', () => {
    const headers = buildApiHeaders({ token: null, acceptLanguage: 'en' });

    assert.equal(headers.has('authorization'), false);
    assert.equal(headers.get('accept'), 'application/json');
    assert.equal(headers.get('accept-language'), 'en');
    assert.equal(headers.get('content-type'), 'application/json');
  });

  it('carries the bearer token of a signed-in reader', () => {
    const headers = buildApiHeaders({ token: 'abc', acceptLanguage: 'ja' });

    assert.equal(headers.get('authorization'), 'Bearer abc');
    assert.equal(headers.get('accept-language'), 'ja');
  });

  it('lets a caller header replace the default of any casing', () => {
    const headers = buildApiHeaders({
      token: null,
      acceptLanguage: 'en',
      headers: { 'content-type': 'multipart/form-data' }
    });

    assert.equal(headers.get('content-type'), 'multipart/form-data');
  });
});
