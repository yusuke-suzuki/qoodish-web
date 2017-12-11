import ApplicationError from './ApplicationError';

export default class LeaveMapFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to unfollow map.') {
    super(detail, status);
  }
}
