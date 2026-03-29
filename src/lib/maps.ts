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
    if (!res.ok) {
      console.error(`Failed to fetch map ${mapId}: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('Error in getMap:', error);
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
    if (!res.ok) {
      console.error(`Failed to fetch active maps: ${res.status}`);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Error in getActiveMaps:', error);
    return [];
  }
}

export async function getPopularMaps(lang: string): Promise<AppMap[]> {
  try {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/guest/maps?popular=true`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Language': lang,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 300 }
      }
    );
    if (!res.ok) {
      console.error(`Failed to fetch popular maps: ${res.status}`);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Error in getPopularMaps:', error);
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
    if (!res.ok) {
      console.error(`Failed to fetch recent maps: ${res.status}`);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Error in getRecentMaps:', error);
    return [];
  }
}
