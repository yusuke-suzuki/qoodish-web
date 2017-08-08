import ApplicationError from './ApplicationError';

export default class JoinMapFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to join map.') {
    super(detail, status);
  }
}
