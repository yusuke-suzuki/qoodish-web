import { getMessaging, getToken } from 'firebase/messaging';
import { useCallback, useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import ServiceWorkerContext from '../context/ServiceWorkerContext';

export function usePushManager() {
  const [subscription, setSubscription] = useState<PushSubscription>(null);

  const { registration } = useContext(ServiceWorkerContext);
  const { currentUser } = useContext(AuthContext);

  const [registrationToken, setRegistrationToken] = useState(null);

  const initPushStatus = useCallback(async () => {
    const sub = await registration.pushManager.getSubscription();

    setSubscription(sub);
  }, [registration]);

  const persistRegistrationToken = useCallback(async () => {
    try {
      const token = await currentUser.getIdToken();

      await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/devices/${registrationToken}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Failed to send registration token', error);
    }
  }, [registrationToken, currentUser]);

  const deleteRegistrationToken = useCallback(async () => {
    try {
      const token = await currentUser.getIdToken();

      await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/devices/${registrationToken}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Failed to delete registration token', error);
    }
  }, [registrationToken, currentUser]);

  const subscribe = useCallback(async () => {
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY
    });

    setSubscription(sub);
  }, [registration]);

  const unsubscribe = useCallback(async () => {
    const successful = await subscription.unsubscribe();

    if (successful) {
      setSubscription(null);
    }

    await deleteRegistrationToken();
  }, [subscription, deleteRegistrationToken]);

  const getRegistrationToken = useCallback(async () => {
    const messaging = getMessaging();
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
    });

    if (!token) {
      console.log('Unable to get registration token.');
      return;
    }

    setRegistrationToken(token);
  }, [getMessaging, getToken, registration]);

  useEffect(() => {
    if (currentUser && currentUser.isAnonymous) {
      // When signed out or deleted account
      unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    if (registrationToken) {
      persistRegistrationToken();
    }
  }, [registrationToken]);

  useEffect(() => {
    if (subscription) {
      getRegistrationToken();
    }
  }, [subscription]);

  useEffect(() => {
    if (registration && currentUser && !currentUser.isAnonymous) {
      initPushStatus();
    }
  }, [registration, currentUser]);

  return {
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    isSubscribed: subscription ? true : false,
    registrationToken: registrationToken
  };
}
