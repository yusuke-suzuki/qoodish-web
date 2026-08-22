import { getMessaging, getToken } from 'firebase/messaging';
import { useContext, useEffect, useState } from 'react';
import { registerDevice } from '../actions/devices';
import AuthContext from '../context/AuthContext';

export function usePushManager(registration: ServiceWorkerRegistration | null) {
  const [subscription, setSubscription] = useState<PushSubscription>(null);

  const { authenticated, isLoading } = useContext(AuthContext);

  const [registrationToken, setRegistrationToken] = useState(null);

  const subscribe = async () => {
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY
    });

    setSubscription(sub);
  };

  const unsubscribe = async () => {
    if (!subscription || isLoading) {
      return;
    }

    const successful = await subscription.unsubscribe();

    if (successful) {
      setSubscription(null);
    }
  };

  useEffect(() => {
    if (authenticated || isLoading || !subscription) {
      return;
    }

    subscription.unsubscribe().then((successful) => {
      if (successful) {
        setSubscription(null);
      }
    });
  }, [authenticated, isLoading, subscription]);

  useEffect(() => {
    if (!registrationToken) {
      return;
    }

    const persistRegistrationToken = async () => {
      try {
        await registerDevice(registrationToken);
      } catch (error) {
        console.error('Failed to send registration token', error);
      }
    };

    persistRegistrationToken();
  }, [registrationToken]);

  useEffect(() => {
    if (!subscription) {
      return;
    }

    let cancelled = false;

    const getRegistrationToken = async () => {
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
      });

      if (cancelled) {
        return;
      }

      if (!token) {
        console.log('Unable to get registration token.');
        return;
      }

      setRegistrationToken(token);
    };

    getRegistrationToken();

    return () => {
      cancelled = true;
    };
  }, [subscription, registration]);

  useEffect(() => {
    if (!registration || !authenticated) {
      return;
    }

    let cancelled = false;

    const initPushStatus = async () => {
      const sub = await registration.pushManager.getSubscription();

      if (!cancelled) {
        setSubscription(sub);
      }
    };

    initPushStatus();

    return () => {
      cancelled = true;
    };
  }, [registration, authenticated]);

  return {
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    isSubscribed: !!subscription,
    registrationToken: registrationToken
  };
}
