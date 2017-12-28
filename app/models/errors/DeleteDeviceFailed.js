import ApplicationError from './ApplicationError';

export default class DeleteDeviceFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to delete device.') {
    super(detail, status);
  }
}
