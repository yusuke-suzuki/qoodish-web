import ApplicationError from './ApplicationError';

export default class DeleteUserFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to delete user.') {
    super(detail, status);
  }
}
