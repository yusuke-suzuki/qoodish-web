import ApplicationError from './ApplicationError';

export default class DeleteReviewFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to delete review.') {
    super(detail, status);
  }
}
