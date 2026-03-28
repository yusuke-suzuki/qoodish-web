import type { AppMap } from '../../types';

export async function getMap(
  mapId: string,
  lang: string
): Promise<AppMap | null> {
  try {
    const res = await fetch(`${process.env.API_ENDPOINT}/guest/maps/${mapId}`, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': lang,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 300 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getActiveMaps(lang: string): Promise<AppMap[]> {
  try {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/guest/maps?active=true`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Language': lang,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 300 }
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getRecentMaps(lang: string): Promise<AppMap[]> {
  try {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/guest/maps?recent=true`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Language': lang,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 300 }
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
