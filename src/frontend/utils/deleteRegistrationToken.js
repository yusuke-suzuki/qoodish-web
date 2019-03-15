import initializeApiClient from './initializeApiClient';
import { DevicesApi } from 'qoodish_api';

const deleteRegistrationToken = async () => {
  const registrationToken = localStorage.registrationToken;
  if (!registrationToken) {
    return;
  }

  await initializeApiClient();
  const apiInstance = new DevicesApi();

  apiInstance.devicesRegistrationTokenDelete(
    registrationToken,
    (error, data, response) => {
      if (response.ok) {
        localStorage.removeItem('registrationToken');

        console.log('Successfully deleted registration token.');
      } else {
        console.log('Failed to delete registration token.');
      }
    }
  );
};

export default deleteRegistrationToken;
