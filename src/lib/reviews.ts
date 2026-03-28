import type { Review } from '../../types';

export async function getReview(
  reviewId: string,
  lang: string
): Promise<Review | null> {
  try {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/guest/reviews/${reviewId}`,
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
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
