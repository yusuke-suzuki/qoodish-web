import ApplicationError from './ApplicationError';

export default class UpdateMapFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to update map.') {
    super(detail, status);
  }
}
