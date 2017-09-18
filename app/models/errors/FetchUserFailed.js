import ApplicationError from './ApplicationError';

export default class FetchUserFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to fetch user.') {
    super(detail, status);
  }
}
