import ApplicationError from './ApplicationError';

export default class FetchMapFailed extends ApplicationError {
  constructor() {
    super('Failed to fetch map.', 500);
  }
}
