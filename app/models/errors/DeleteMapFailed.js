import ApplicationError from './ApplicationError';

export default class DeleteMapFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to delete map.') {
    super(detail, status);
  }
}
