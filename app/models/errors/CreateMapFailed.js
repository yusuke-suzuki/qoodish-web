import ApplicationError from './ApplicationError';

export default class CreateMapFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to create map.') {
    super(detail, status);
  }
}
