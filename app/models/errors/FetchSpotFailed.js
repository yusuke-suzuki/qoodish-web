import ApplicationError from './ApplicationError';

export default class FetchSpotFailed extends ApplicationError {
  constructor() {
    super('Failed to fetch spot.', 500);
  }
}
