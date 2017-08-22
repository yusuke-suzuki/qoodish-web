import ApplicationError from './ApplicationError';

export default class FetchReviewFailed extends ApplicationError {
  constructor() {
    super('Failed to fetch review.', 500);
  }
}
