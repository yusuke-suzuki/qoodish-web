import ApplicationError from './ApplicationError';

export default class FetchReviewsFailed extends ApplicationError {
  constructor() {
    super('Failed to fetch reviews.', 500);
  }
}
