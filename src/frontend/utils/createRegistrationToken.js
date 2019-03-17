import getFirebase from './getFirebase';
import getFirebaseMessaging from './getFirebaseMessaging';
import initializeApiClient from './initializeApiClient';
import { DevicesApi, InlineObject } from 'qoodish_api';

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

  await initializeApiClient();

  const apiInstance = new DevicesApi();
  const inlineObject = InlineObject.constructFromObject({
    registration_token: registrationToken
  });

  apiInstance.devicesPost(inlineObject, (error, data, response) => {
    if (response.ok) {
      console.log('Successfully sent registration token.');
      localStorage.registrationToken = registrationToken;
    } else {
      console.log('Failed to send registration token.');
    }
  });
};

export default createRegistrationToken;
