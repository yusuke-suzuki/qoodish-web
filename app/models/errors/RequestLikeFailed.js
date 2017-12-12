import ApplicationError from './ApplicationError';

export default class RequestLikeFailed extends ApplicationError {
  constructor(status = 500, detail = 'Request like failed.') {
    super(detail, status);
  }
}
