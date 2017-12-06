import ApplicationError from './ApplicationError';

export default class FetchPlacesFailed extends ApplicationError {
  constructor() {
    super('Failed to fetch places.', 500);
  }
}
