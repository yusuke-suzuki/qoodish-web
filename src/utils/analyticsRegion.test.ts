import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ANALYTICS_COOKIE,
  analyticsAllowed,
  hasAnalyticsCookie
} from './analyticsRegion.ts';

describe('analyticsAllowed', () => {
  it('restricts every EU member state', () => {
    const members = [
      'AT',
      'BE',
      'BG',
      'CY',
      'CZ',
      'DE',
      'DK',
      'EE',
      'ES',
      'FI',
      'FR',
      'GR',
      'HR',
      'HU',
      'IE',
      'IT',
      'LT',
      'LU',
      'LV',
      'MT',
      'NL',
      'PL',
      'PT',
      'RO',
      'SE',
      'SI',
      'SK'
    ];

    assert.equal(members.length, 27);

    for (const country of members) {
      assert.equal(analyticsAllowed(country, false), false, country);
    }
  });

  it('restricts the EEA, the UK and Switzerland', () => {
    for (const country of ['IS', 'LI', 'NO', 'GB', 'CH']) {
      assert.equal(analyticsAllowed(country, false), false, country);
    }
  });

  it('restricts EU outermost regions that carry their own country code', () => {
    for (const country of ['GF', 'GP', 'MQ', 'RE', 'YT', 'MF', 'AX']) {
      assert.equal(analyticsAllowed(country, false), false, country);
    }
  });

  it('restricts Tor and unknown locations', () => {
    assert.equal(analyticsAllowed('T1', false), false);
    assert.equal(analyticsAllowed('XX', false), false);
    assert.equal(analyticsAllowed('T1', true), false);
  });

  it('allows countries outside the restricted regions', () => {
    for (const country of ['JP', 'US', 'KR', 'AU', 'BR']) {
      assert.equal(analyticsAllowed(country, false), true, country);
    }
  });

  it('ignores the case of the country code', () => {
    assert.equal(analyticsAllowed('de', false), false);
    assert.equal(analyticsAllowed('jp', false), true);
  });

  it('restricts a missing country outside local development', () => {
    assert.equal(analyticsAllowed(undefined, false), false);
    assert.equal(analyticsAllowed(null, false), false);
    assert.equal(analyticsAllowed('', false), false);
  });

  it('allows a missing country in local development', () => {
    assert.equal(analyticsAllowed(undefined, true), true);
  });
});

describe('hasAnalyticsCookie', () => {
  it('finds the flag among other cookies', () => {
    assert.equal(
      hasAnalyticsCookie(`signed_in=1; ${ANALYTICS_COOKIE}=1; theme=dark`),
      true
    );
  });

  it('is false without the flag or with another value', () => {
    assert.equal(hasAnalyticsCookie(''), false);
    assert.equal(hasAnalyticsCookie('signed_in=1'), false);
    assert.equal(hasAnalyticsCookie(`${ANALYTICS_COOKIE}=0`), false);
    assert.equal(hasAnalyticsCookie(`x${ANALYTICS_COOKIE}=1`), false);
  });
});
