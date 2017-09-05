import ApplicationError from './ApplicationError';

export default class CreateDeviceFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to create device.') {
    super(detail, status);
  }
}
