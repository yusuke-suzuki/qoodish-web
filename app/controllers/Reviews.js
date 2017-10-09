import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Reviews extends Application {
  async index(ctx) {
    const client = new QoodishClient;
    let reviews;
    let token = ctx.request.headers.authorization;
    let query = ctx.request.query;
    if (query.recent) {
      reviews = await client.fetchRecentReviews(token, ctx.currentLocale);
    } else if (ctx.params.mapId && query.place_id) {
      reviews = await client.fetchSpotReviews(token, ctx.currentLocale, ctx.params.mapId, query.place_id);
    } else if (query.next_timestamp) {
      reviews = await client.fetchReviews(token, ctx.currentLocale, query.next_timestamp);
    } else {
      reviews = await client.fetchReviews(token, ctx.currentLocale);
    }
    return reviews;
  }

  async show(ctx) {
    const client = new QoodishClient;
    let review = await client.fetchReview(ctx.request.headers.authorization, ctx.currentLocale, ctx.params.mapId, ctx.params.reviewId);
    return review;
  }

  async create(ctx) {
    const client = new QoodishClient;
    let review = await client.createReview(ctx.request.headers.authorization, ctx.params.mapId, ctx.request.body);
    return review;
  }

  async update(ctx) {
    const client = new QoodishClient;
    let review = await client.updateReview(ctx.request.headers.authorization, ctx.params.reviewId, ctx.request.body);
    return review;
  }

  async delete(ctx) {
    const client = new QoodishClient;
    let review = await client.deleteReview(ctx.request.headers.authorization, ctx.params.reviewId);
    return review;
  }
}

export default Reviews;
