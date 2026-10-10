import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
  compare,
  type Difference,
  keyOrderDifferences
} from './compare/diff.ts';

type Response = { status: number; body: unknown };

type Discovered = {
  maps: Set<number>;
  pins: Set<number>;
  chapters: Set<number>;
  users: Set<number>;
  words: Set<string>;
};

const { values } = parseArgs({
  options: {
    rails: { type: 'string' },
    worker: { type: 'string' },
    language: { type: 'string', default: 'ja' },
    limit: { type: 'string', default: '30' },
    pages: { type: 'string', default: '3' },
    concurrency: { type: 'string', default: '4' },
    paths: { type: 'string' },
    verbose: { type: 'boolean', default: false }
  }
});

if (!values.rails || !values.worker) {
  console.error(
    'Usage: node scripts/compare.ts --rails https://api-dev.qoodish.com --worker https://api-next-dev.qoodish.com [--paths FILE] [--limit 30] [--pages 3]'
  );
  process.exit(2);
}

const rails = values.rails.replace(/\/$/, '');
const worker = values.worker.replace(/\/$/, '');
const limit = Number(values.limit);
const pages = Number(values.pages);
const concurrency = Number(values.concurrency);

async function request(base: string, path: string): Promise<Response> {
  const res = await fetch(`${base}${path}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': values.language ?? 'ja'
    }
  });
  const text = await res.text();

  try {
    return { status: res.status, body: JSON.parse(text) };
  } catch {
    return { status: res.status, body: text };
  }
}

async function inBatches<Item, Result>(
  items: readonly Item[],
  task: (item: Item) => Promise<Result>
): Promise<Result[]> {
  const results: Result[] = [];

  for (let index = 0; index < items.length; index += concurrency) {
    results.push(
      ...(await Promise.all(items.slice(index, index + concurrency).map(task)))
    );
  }

  return results;
}

function records(body: unknown): Record<string, unknown>[] {
  const list = Array.isArray(body)
    ? body
    : typeof body === 'object' &&
        body !== null &&
        Array.isArray((body as { data?: unknown }).data)
      ? (body as { data: unknown[] }).data
      : typeof body === 'object' && body !== null
        ? [body]
        : [];

  return list.filter(
    (item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null
  );
}

function idOf(value: unknown): number | undefined {
  return typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'number'
    ? (value as { id: number }).id
    : undefined;
}

type Kind = 'maps' | 'pins' | 'chapters' | 'users';

function kindOf(path: string): Kind | undefined {
  const route = path.split('?')[0] ?? '';

  if (/\/coauthors$/.test(route) || /^\/guest\/users\/\d+$/.test(route))
    return 'users';
  if (/\/pins(\/\d+)?$/.test(route)) return 'pins';
  if (/\/chapters(\/\d+)?$/.test(route)) return 'chapters';
  if (/\/maps(\/\d+|\/featured)?$/.test(route)) return 'maps';

  return undefined;
}

function collect(path: string, body: unknown, found: Discovered): void {
  const kind = kindOf(path);

  for (const record of records(body)) {
    const id = idOf(record);
    const authorId = idOf(record.author);
    const mapId = idOf(record.map);

    if (kind && id !== undefined) {
      found[kind].add(id);
    }

    if (authorId !== undefined) found.users.add(authorId);
    if (mapId !== undefined) found.maps.add(mapId);

    for (const comment of Array.isArray(record.comments)
      ? record.comments
      : []) {
      const commenter = idOf((comment as { author?: unknown }).author);
      if (commenter !== undefined) found.users.add(commenter);
    }

    for (const text of [record.name, record.title]) {
      if (typeof text === 'string') {
        const word = text.split(/\s+/u).find((part) => [...part].length >= 2);
        if (word) found.words.add(word);
      }
    }
  }
}

async function followCursors(path: string, first: Response): Promise<string[]> {
  const visited: string[] = [];
  let response = first;

  for (let page = 1; page < pages; page++) {
    const cursor = (response.body as { next_cursor?: string | null } | null)
      ?.next_cursor;

    if (!cursor) break;

    const next = `${path}${path.includes('?') ? '&' : '?'}cursor=${encodeURIComponent(cursor)}`;
    visited.push(next);
    response = await request(rails, next);
  }

  return visited;
}

function take<Item>(items: Set<Item>): Item[] {
  return [...items].slice(0, limit);
}

async function discover(): Promise<string[]> {
  const found: Discovered = {
    maps: new Set(),
    pins: new Set(),
    chapters: new Set(),
    users: new Set(),
    words: new Set()
  };
  const listings = [
    '/guest/maps?recent=true',
    '/guest/maps?active=true',
    '/guest/maps?popular=true',
    '/guest/maps?recommend=true',
    '/guest/maps/featured',
    '/guest/pins?recent=true',
    '/guest/pins?popular=true',
    '/guest/chapters',
    '/guest/v2/pins',
    '/guest/v2/chapters'
  ];
  const paths = [
    ...listings,
    '/guest/maps',
    '/guest/pins',
    '/guest/maps/0',
    '/guest/v2/pins?cursor=invalid'
  ];

  for (const path of listings) {
    const response = await request(rails, path);
    collect(path, response.body, found);

    if (path.startsWith('/guest/v2/')) {
      const next = await followCursors(path, response);
      paths.push(...next);

      for (const nextPath of next) {
        collect(nextPath, (await request(rails, nextPath)).body, found);
      }
    }
  }

  for (const id of take(found.maps)) {
    paths.push(
      `/guest/maps/${id}`,
      `/guest/maps/${id}/pins`,
      `/guest/maps/${id}/coauthors`,
      `/guest/maps/${id}/chapters`,
      `/guest/maps/${id}/pin_properties`
    );
  }

  for (const id of take(found.pins)) paths.push(`/guest/pins/${id}`);

  for (const id of take(found.chapters)) {
    paths.push(`/guest/chapters/${id}`, `/guest/chapters/${id}/comments`);
  }

  for (const id of take(found.users)) {
    const feed = `/guest/v2/users/${id}/pins`;
    paths.push(
      `/guest/users/${id}`,
      `/guest/users/${id}/maps`,
      `/guest/users/${id}/chapters`,
      feed
    );
    paths.push(...(await followCursors(feed, await request(rails, feed))));
  }

  for (const word of take(found.words)) {
    const short = [...word].slice(0, 2).join('');

    for (const term of [word, short]) {
      const input = encodeURIComponent(term);
      paths.push(
        `/guest/maps?input=${input}`,
        `/guest/pins?input=${input}`,
        `/guest/chapters?input=${input}`
      );
    }
  }

  return [...new Set(paths)];
}

function format(value: unknown): string {
  const text = JSON.stringify(value) ?? 'undefined';
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

const extra = values.paths
  ? readFileSync(values.paths, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('/guest/'))
  : [];
const paths = [...new Set([...(await discover()), ...extra])];

const results = await inBatches(paths, async (path) => {
  const [expected, actual] = await Promise.all([
    request(rails, path),
    request(worker, path)
  ]);
  const statusDifference: Difference[] =
    expected.status === actual.status
      ? []
      : [{ path: 'status', rails: expected.status, worker: actual.status }];
  const body = compare(path, expected.body, actual.body);

  return {
    path,
    differences: [...statusDifference, ...body.differences],
    reordered: body.reordered,
    keyOrder:
      body.differences.length === 0
        ? keyOrderDifferences(expected.body, actual.body)
        : []
  };
});

const failed = results.filter((result) => result.differences.length > 0);
const reordered = results.filter((result) => result.reordered);
const keyOrder = results.filter((result) => result.keyOrder.length > 0);

for (const result of failed) {
  console.log(`✗ ${result.path}`);

  for (const difference of result.differences.slice(0, 5)) {
    console.log(
      `    ${difference.path}: rails=${format(difference.rails)} worker=${format(difference.worker)}`
    );
  }

  if (result.differences.length > 5) {
    console.log(`    ... ${result.differences.length - 5} more`);
  }
}

if (values.verbose) {
  for (const result of reordered)
    console.log(`~ ${result.path} (same records, different order)`);
  for (const result of keyOrder)
    console.log(
      `! ${result.path} key order: ${result.keyOrder.slice(0, 3).join(', ')}`
    );
}

console.log(
  `\n${results.length} paths: ${results.length - failed.length} match (${reordered.length} only in another order, ${keyOrder.length} with another key order), ${failed.length} differ`
);

process.exitCode = failed.length > 0 ? 1 : 0;
