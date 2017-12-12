import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Likes extends Application {
  async index(ctx) {
    const client = new QoodishClient;
    let likes = await client.fetchReviewLikes(ctx.request.headers.authorization, ctx.params.reviewId);
    return likes;
  }

  async create(ctx) {
    const client = new QoodishClient;
    let review = await client.likeReview(ctx.request.headers.authorization, ctx.params.reviewId, ctx.currentLocale);
    return review;
  }

  async destroy(ctx) {
    const client = new QoodishClient;
    let review = await client.unlikeReview(ctx.request.headers.authorization, ctx.params.reviewId, ctx.currentLocale);
    return review;
  }
}

export default Likes;
