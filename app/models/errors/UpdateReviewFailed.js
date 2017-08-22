import ApplicationError from './ApplicationError';

export default class UpdateReviewFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to update review.') {
    super(detail, status);
  }
}
