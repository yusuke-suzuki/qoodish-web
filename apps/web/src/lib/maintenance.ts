import describeError from '../utils/describeError.ts';
import type { Dictionary } from '../utils/getDictionary.ts';

type MaintenanceLocale = 'en' | 'ja';

export type Maintenance = {
  message?: Partial<Record<MaintenanceLocale, string>>;
};

const KV_KEY = 'maintenance';
const CACHE_TTL_MS = 30_000;

type CacheEntry = {
  readAt: number;
  result: Promise<Maintenance | null>;
};

let cache: CacheEntry | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function parseMaintenance(value: unknown): Maintenance | null {
  if (!isRecord(value)) return null;

  const { message } = value;

  if (message === undefined) return {};

  if (
    !isRecord(message) ||
    !isOptionalString(message.en) ||
    !isOptionalString(message.ja)
  ) {
    return null;
  }

  return { message: { en: message.en, ja: message.ja } };
}

async function readMaintenanceFlag(): Promise<unknown> {
  const { getCloudflareContext } = await import('@opennextjs/cloudflare');
  const store = getCloudflareContext().env.MAINTENANCE;
  return store ? store.get(KV_KEY, 'json') : null;
}

async function loadMaintenance(): Promise<Maintenance | null> {
  try {
    return parseMaintenance(await readMaintenanceFlag());
  } catch (error) {
    console.error(`Maintenance flag unavailable: ${describeError(error)}`);
    cache = undefined;
    return null;
  }
}

export function getMaintenance(): Promise<Maintenance | null> {
  const now = Date.now();

  if (!cache || now - cache.readAt >= CACHE_TTL_MS) {
    cache = { readAt: now, result: loadMaintenance() };
  }

  return cache.result;
}

function toMaintenanceLocale(locale: string): MaintenanceLocale {
  return locale === 'ja' ? 'ja' : 'en';
}

export function maintenanceMessage(
  maintenance: Maintenance | null,
  locale: string,
  dictionary: Dictionary
): string | null {
  if (!maintenance) return null;

  return (
    maintenance.message?.[toMaintenanceLocale(locale)] ||
    dictionary['maintenance in progress']
  );
}
