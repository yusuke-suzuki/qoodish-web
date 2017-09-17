import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Reviews extends Application {
  async index(token, locale, mapId = null, params) {
    const client = new QoodishClient;
    let reviews;
    if (params.recent) {
      reviews = await client.fetchRecentReviews(token, locale);
    } else if (mapId && params.place_id) {
      reviews = await client.fetchSpotReviews(token, locale, mapId, params.place_id);
    } else if (params.next_timestamp) {
      reviews = await client.fetchReviews(token, locale, params.next_timestamp);
    } else {
      reviews = await client.fetchReviews(token, locale);
    }
    return reviews;
  }

  async show(token, locale, mapId, reviewId) {
    const client = new QoodishClient;
    let review = await client.fetchReview(token, locale, mapId, reviewId);
    return review;
  }

  async create(token, mapId, params) {
    const client = new QoodishClient;
    let review = await client.createReview(token, mapId, params);
    return review;
  }

  async update(token, reviewId, params) {
    const client = new QoodishClient;
    let review = await client.updateReview(token, reviewId, params);
    return review;
  }

  async delete(token, reviewId) {
    const client = new QoodishClient;
    let review = await client.deleteReview(token, reviewId);
    return review;
  }
}

export default Reviews;
