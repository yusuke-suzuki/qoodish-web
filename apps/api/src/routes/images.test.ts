import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { database } from '../db/client.ts';
import { images } from '../db/schema.ts';
import { send } from '../test/client.ts';
import { ids, seedWorld } from '../test/world.ts';

const DIRECT_UPLOAD_URL =
  'https://api.cloudflare.com/client/v4/accounts/test-account/images/v2/direct_upload';

beforeAll(async () => {
  await seedWorld(env.DB);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function answerDirectUpload(response: () => Response) {
  const requests: Request[] = [];
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input, init) => {
      requests.push(new Request(input, init));
      return response();
    });

  return { fetch, requests };
}

function directUploadAnswer(cloudflareId: string): Response {
  return Response.json({
    success: true,
    errors: [],
    messages: [],
    result: {
      id: cloudflareId,
      uploadURL: `https://upload.imagedelivery.net/mockhash/${cloudflareId}`
    }
  });
}

function imagesOf(userId: number) {
  return database(env.DB)
    .select({ url: images.url })
    .from(images)
    .where(eq(images.userId, userId));
}

describe('POST /images', () => {
  it('requests a direct upload and records the image it will deliver', async () => {
    const { requests } = answerDirectUpload(() =>
      directUploadAnswer('qoodish/mock-cf-id')
    );

    const res = await send('POST', '/images', 'bob');

    expect(res).toEqual({
      status: 200,
      body: {
        id: expect.any(Number),
        upload_url:
          'https://upload.imagedelivery.net/mockhash/qoodish/mock-cf-id'
      }
    });

    const [row] = await database(env.DB)
      .select()
      .from(images)
      .where(eq(images.id, res.body.id));

    expect(row).toMatchObject({
      userId: ids.bob,
      url: 'https://imagedelivery.net/mockhash/qoodish/mock-cf-id/public'
    });

    expect(requests).toHaveLength(1);
    const [request] = requests;

    expect(request?.method).toBe('POST');
    expect(request?.url).toBe(DIRECT_UPLOAD_URL);
    expect(request?.headers.get('authorization')).toBe('Bearer test-token');
    expect(request?.headers.get('content-type')).toMatch(
      /^multipart\/form-data; boundary=/
    );

    const form = await request?.formData();

    expect(form?.get('id')).toMatch(
      /^qoodish\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(JSON.parse(String(form?.get('metadata')))).toEqual({
      app: 'qoodish',
      env: 'test'
    });
    expect([...(form?.keys() ?? [])].sort()).toEqual(['id', 'metadata']);
  });

  it('asks Cloudflare for a fresh image id on every request', async () => {
    const { requests } = answerDirectUpload(() =>
      directUploadAnswer(`qoodish/${crypto.randomUUID()}`)
    );

    await send('POST', '/images', 'carol');
    await send('POST', '/images', 'carol');

    const [first, second] = await Promise.all(
      requests.map(async (request) => (await request.formData()).get('id'))
    );

    expect(first).not.toBe(second);
    expect(await imagesOf(ids.carol)).toHaveLength(2);
  });

  it.each([
    [
      'rejects the request',
      () =>
        Response.json(
          {
            success: false,
            errors: [{ code: 10000, message: 'Authentication error' }]
          },
          { status: 403 }
        )
    ],
    [
      'answers 200 without success',
      () => Response.json({ success: false, errors: [], result: null })
    ]
  ])(
    'answers 500 and records nothing when Cloudflare %s',
    async (_, answer) => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      answerDirectUpload(answer);
      const before = await imagesOf(ids.alice);

      const res = await send('POST', '/images', 'alice');

      expect(res).toEqual({
        status: 500,
        body: {
          title: 'InternalServerError',
          detail: 'The request has failed due to some unknown error.'
        }
      });
      expect(await imagesOf(ids.alice)).toEqual(before);
    }
  );

  it('answers 500 and records nothing when Cloudflare cannot be reached', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException(
        'The operation was aborted due to timeout',
        'TimeoutError'
      )
    );
    const before = await imagesOf(ids.alice);

    const res = await send('POST', '/images', 'alice');

    expect(res.status).toBe(500);
    expect(res.body.title).toBe('InternalServerError');
    expect(await imagesOf(ids.alice)).toEqual(before);
  });

  it('answers 401 without a signed-in user and never calls Cloudflare', async () => {
    const { fetch } = answerDirectUpload(() =>
      directUploadAnswer('qoodish/unused')
    );

    expect((await send('POST', '/images')).status).toBe(401);
    expect((await send('POST', '/images', 'stranger')).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
});
