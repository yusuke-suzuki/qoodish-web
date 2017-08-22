import ApplicationError from './ApplicationError';

export default class CreateReviewFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to create review.') {
    super(detail, status);
  }
}
