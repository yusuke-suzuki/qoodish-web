import ApplicationError from './ApplicationError';

export default class FetchNotificationsFailed extends ApplicationError {
  constructor() {
    super('Failed to fetch notifications.', 500);
  }
}
