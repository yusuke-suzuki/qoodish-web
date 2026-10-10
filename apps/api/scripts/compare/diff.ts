export type Difference = {
  path: string;
  rails: unknown;
  worker: unknown;
};

export type Comparison = 'exact' | 'unordered' | 'status';

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function differences(
  rails: unknown,
  worker: unknown,
  path = '$'
): Difference[] {
  if (Array.isArray(rails) && Array.isArray(worker)) {
    const found: Difference[] =
      rails.length === worker.length
        ? []
        : [
            {
              path: `${path}.length`,
              rails: rails.length,
              worker: worker.length
            }
          ];

    for (
      let index = 0;
      index < Math.min(rails.length, worker.length);
      index++
    ) {
      found.push(
        ...differences(rails[index], worker[index], `${path}[${index}]`)
      );
    }

    return found;
  }

  if (isObject(rails) && isObject(worker)) {
    const keys = [...new Set([...Object.keys(rails), ...Object.keys(worker)])];

    return keys.flatMap((key) => {
      const child = `${path}.${key}`;

      if (!(key in rails)) {
        return [{ path: child, rails: undefined, worker: worker[key] }];
      }

      if (!(key in worker)) {
        return [{ path: child, rails: rails[key], worker: undefined }];
      }

      return differences(rails[key], worker[key], child);
    });
  }

  return Object.is(rails, worker) ? [] : [{ path, rails, worker }];
}

export function keyOrderDifferences(
  rails: unknown,
  worker: unknown,
  path = '$'
): string[] {
  if (Array.isArray(rails) && Array.isArray(worker)) {
    return rails
      .slice(0, worker.length)
      .flatMap((item, index) =>
        keyOrderDifferences(item, worker[index], `${path}[${index}]`)
      );
  }

  if (isObject(rails) && isObject(worker)) {
    const order = (object: JsonObject, other: JsonObject) =>
      Object.keys(object).filter((key) => key in other);
    const own =
      order(rails, worker).join(',') === order(worker, rails).join(',')
        ? []
        : [path];

    return [
      ...own,
      ...Object.keys(rails)
        .filter((key) => key in worker)
        .flatMap((key) =>
          keyOrderDifferences(rails[key], worker[key], `${path}.${key}`)
        )
    ];
  }

  return [];
}

function byId(items: unknown[]): unknown[] {
  return [...items].sort((left, right) => {
    const leftId = isObject(left) ? Number(left.id) : 0;
    const rightId = isObject(right) ? Number(right.id) : 0;

    return leftId - rightId;
  });
}

export function withoutOrder(body: unknown): unknown {
  if (Array.isArray(body)) {
    return byId(body);
  }

  if (isObject(body) && Array.isArray(body.data)) {
    return { ...body, data: byId(body.data) };
  }

  return body;
}

export function comparisonFor(path: string): Comparison {
  const query = new URLSearchParams(path.split('?')[1] ?? '');

  if (query.has('recommend')) {
    return 'status';
  }

  if (query.has('input') || query.has('active') || query.has('popular')) {
    return 'unordered';
  }

  return 'exact';
}

export function compare(
  path: string,
  rails: unknown,
  worker: unknown
): { differences: Difference[]; reordered: boolean } {
  const comparison = comparisonFor(path);

  if (comparison === 'status') {
    return { differences: [], reordered: false };
  }

  const exact = differences(rails, worker);

  if (comparison === 'exact' || exact.length === 0) {
    return { differences: exact, reordered: false };
  }

  const unordered = differences(withoutOrder(rails), withoutOrder(worker));

  return { differences: unordered, reordered: unordered.length === 0 };
}
