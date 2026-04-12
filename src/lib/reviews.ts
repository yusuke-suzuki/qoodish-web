import type { Review } from '../../types';

export async function getReview(
  reviewId: string,
  lang: string,
  token?: string,
  mapId?: string
): Promise<Review | null> {
  try {
    const path =
      token && mapId
        ? `/maps/${mapId}/reviews/${reviewId}`
        : `/guest/reviews/${reviewId}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Accept-Language': lang,
      'Content-Type': 'application/json'
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${process.env.API_ENDPOINT}${path}`, {
      headers,
      next: { revalidate: token ? 0 : 300 }
    });
    if (!res.ok) {
      console.error(`Failed to fetch review ${reviewId}: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('Error in getReview:', error);
    return null;
  }
}

export async function getPopularReviews(lang: string): Promise<Review[]> {
  try {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/guest/reviews?popular=true`,
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
      console.error(`Failed to fetch popular reviews: ${res.status}`);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Error in getPopularReviews:', error);
    return [];
  }
}

export async function getRecentReviews(lang: string): Promise<Review[]> {
  try {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/guest/reviews?recent=true`,
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
      console.error(`Failed to fetch recent reviews: ${res.status}`);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Error in getRecentReviews:', error);
    return [];
  }
}
