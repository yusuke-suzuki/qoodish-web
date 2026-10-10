import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import { getDictionary } from '../utils/getDictionary.ts';

type Env = { MAINTENANCE?: { get: ReturnType<typeof mock.fn> } };

let env: Env = {};
let contextAvailable = true;

mock.module('@opennextjs/cloudflare', {
  namedExports: {
    getCloudflareContext: () => {
      if (!contextAvailable) {
        throw new Error('no request scope');
      }
      return { env };
    }
  }
});

const maintenance = () => import('./maintenance.ts');

const flag = { until: '2026-10-20T15:00:00+09:00' };

function bindStore(value: unknown): ReturnType<typeof mock.fn> {
  const get = mock.fn(async () => value);
  env = { MAINTENANCE: { get } };
  return get;
}

let now = 1_700_000_000_000;

beforeEach(() => {
  env = {};
  contextAvailable = true;
  now += 60_000;
});

describe('getMaintenance', () => {
  it('reads nothing when the worker has no binding', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now });
    const { getMaintenance } = await maintenance();

    assert.equal(await getMaintenance(), null);
  });

  it('reads nothing outside a request scope', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now });
    t.mock.method(console, 'error', () => {});
    contextAvailable = false;
    const { getMaintenance } = await maintenance();

    assert.equal(await getMaintenance(), null);
  });

  it('parses the flag the namespace holds', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now });
    const get = bindStore({ ...flag, message: { ja: 'メンテナンス中' } });
    const { getMaintenance } = await maintenance();

    assert.deepEqual(await getMaintenance(), {
      ...flag,
      message: { en: undefined, ja: 'メンテナンス中' }
    });
    assert.deepEqual(get.mock.calls[0].arguments, ['maintenance', 'json']);
  });

  it('ignores a flag it cannot interpret', async (t) => {
    const { getMaintenance } = await maintenance();

    for (const malformed of [
      'soon',
      42,
      [],
      {},
      { until: 'tomorrow' },
      { until: 1 },
      { ...flag, message: 'down' },
      { ...flag, message: { en: 1 } }
    ]) {
      now += 60_000;
      t.mock.timers.enable({ apis: ['Date'], now });
      bindStore(malformed);

      assert.equal(await getMaintenance(), null, JSON.stringify(malformed));
      t.mock.timers.reset();
    }
  });

  it('reuses one read for 30 seconds', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now });
    const get = bindStore(flag);
    const { getMaintenance } = await maintenance();

    await getMaintenance();
    t.mock.timers.tick(29_999);
    await getMaintenance();

    assert.equal(get.mock.callCount(), 1);

    t.mock.timers.tick(1);
    await getMaintenance();

    assert.equal(get.mock.callCount(), 2);
  });

  it('retries right after a failed read instead of caching it', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now });
    t.mock.method(console, 'error', () => {});
    contextAvailable = false;
    const { getMaintenance } = await maintenance();

    assert.equal(await getMaintenance(), null);

    contextAvailable = true;
    const get = bindStore(flag);
    t.mock.timers.tick(1);

    assert.deepEqual(await getMaintenance(), flag);
    assert.equal(get.mock.callCount(), 1);
  });

  it('picks up a cleared flag once the read expires', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now });
    bindStore(flag);
    const { getMaintenance } = await maintenance();

    assert.deepEqual(await getMaintenance(), flag);

    bindStore(null);
    t.mock.timers.tick(30_000);

    assert.equal(await getMaintenance(), null);
  });
});

describe('maintenanceMessage', () => {
  it('gives nothing when no maintenance is on', async () => {
    const { maintenanceMessage } = await maintenance();

    assert.equal(maintenanceMessage(null, 'en', getDictionary('en')), null);
  });

  it('states the end of the maintenance in Tokyo time', async () => {
    const { maintenanceMessage } = await maintenance();

    assert.equal(
      maintenanceMessage(
        { until: '2026-10-20T06:00:00Z' },
        'en',
        getDictionary('en')
      ),
      'Qoodish is under maintenance until Oct 20, 2026, 3:00 PM. Browsing works, but changes cannot be saved.'
    );
    assert.equal(
      maintenanceMessage(
        { until: '2026-10-20T06:00:00Z' },
        'ja',
        getDictionary('ja')
      ),
      'Qoodish は 2026/10/20 15:00 までメンテナンス中です。閲覧はできますが、変更は保存できません。'
    );
  });

  it('prefers the custom message in the viewer’s locale', async () => {
    const { maintenanceMessage } = await maintenance();
    const custom = {
      ...flag,
      message: { en: 'Back soon', ja: 'まもなく再開' }
    };

    assert.equal(
      maintenanceMessage(custom, 'en', getDictionary('en')),
      'Back soon'
    );
    assert.equal(
      maintenanceMessage(custom, 'ja', getDictionary('ja')),
      'まもなく再開'
    );
  });

  it('falls back to the dictionary when the locale has no custom message', async () => {
    const { maintenanceMessage } = await maintenance();

    assert.match(
      maintenanceMessage(
        { ...flag, message: { en: 'Back soon' } },
        'ja',
        getDictionary('ja')
      ) ?? '',
      /^Qoodish は .* までメンテナンス中です。/
    );
  });
});
