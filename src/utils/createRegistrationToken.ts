import getFirebase from './getFirebase';
import getFirebaseMessaging from './getFirebaseMessaging';
import { DevicesApi } from '@yusuke-suzuki/qoodish-api-js-client';

const pushAvailable = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

const createRegistrationToken = async () => {
  if (!pushAvailable()) {
    return;
  }

  const firebase = await getFirebase();
  await getFirebaseMessaging();
  const messaging = firebase.messaging();

  const registrationToken = await messaging.getToken();

  if (!registrationToken) {
    console.log('Unable to get registration token.');
    return;
  }

  const apiInstance = new DevicesApi();

  apiInstance.devicesRegistrationTokenPut(
    registrationToken,
    (error, data, response) => {
      if (response.ok) {
        console.log('Successfully sent registration token.');
        localStorage.registrationToken = registrationToken;
      } else {
        console.log('Failed to send registration token.');
      }
    }
  );
};

export default createRegistrationToken;
