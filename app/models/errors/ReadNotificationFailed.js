import ApplicationError from './ApplicationError';

export default class ReadNotificationFailed extends ApplicationError {
  constructor() {
    super('Failed to read notification.', 500);
  }
}
