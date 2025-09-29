import { getMessaging, getToken } from 'firebase/messaging';
import { useCallback, useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';

export function usePushManager(registration: ServiceWorkerRegistration | null) {
  const [subscription, setSubscription] = useState<PushSubscription>(null);

  const { currentUser, isLoading } = useContext(AuthContext);

  const [registrationToken, setRegistrationToken] = useState(null);

  const initPushStatus = useCallback(async () => {
    const sub = await registration.pushManager.getSubscription();

    setSubscription(sub);
  }, [registration]);

  const persistRegistrationToken = useCallback(async () => {
    try {
      const token = await currentUser.getIdToken();

      const request = new Request(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/devices/${registrationToken}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const res = await fetch(request);

      if (!res.ok) {
        const data = await res.json();
        console.error('Failed to send registration token', data);
      }
    } catch (error) {
      console.error('Failed to send registration token', error);
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
    if (!subscription || isLoading) {
      return;
    }

    const successful = await subscription.unsubscribe();

    if (successful) {
      setSubscription(null);
    }
  }, [subscription, isLoading]);

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
  }, [registration]);

  useEffect(() => {
    if (!currentUser && !isLoading) {
      // When signed out, unsubscribe from push notifications
      unsubscribe();
    }
  }, [currentUser, isLoading, unsubscribe]);

  useEffect(() => {
    if (registrationToken) {
      persistRegistrationToken();
    }
  }, [registrationToken, persistRegistrationToken]);

  useEffect(() => {
    if (subscription) {
      getRegistrationToken();
    }
  }, [subscription, getRegistrationToken]);

  useEffect(() => {
    if (registration && currentUser) {
      initPushStatus();
    }
  }, [registration, currentUser, initPushStatus]);

  return {
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    isSubscribed: !!subscription,
    registrationToken: registrationToken
  };
}
