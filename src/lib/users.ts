import type { Profile } from '../../types';

export async function getProfile(
  userId: string,
  lang: string
): Promise<Profile | null> {
  try {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/guest/users/${userId}`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Language': lang,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 300 }
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
