import { getMessaging, getToken } from 'firebase/messaging';
import { useContext, useEffect, useState } from 'react';
import { registerDevice } from '../actions/devices.ts';
import AuthContext from '../context/AuthContext.ts';

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
      return false;
    }

    const successful = await subscription.unsubscribe();

    if (!successful) {
      console.warn('Push subscription was already inactive');
    }

    // Either outcome leaves no active subscription behind, and the token
    // belongs to the subscription that is now gone.
    setSubscription(null);
    setRegistrationToken(null);

    return true;
  };

  useEffect(() => {
    if (authenticated || isLoading || !subscription) {
      return;
    }

    let cancelled = false;
    const subscriptionToRemove = subscription;

    // The browser-side unsubscribe cannot be cancelled, so once it settles
    // the state must drop the removed subscription even after cleanup ran;
    // the identity check keeps a newer subscription intact.
    subscriptionToRemove
      .unsubscribe()
      .then((successful) => {
        if (!successful) {
          console.warn('Push subscription was already inactive');
        }

        setSubscription((current) =>
          current === subscriptionToRemove ? null : current
        );
        setRegistrationToken(null);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Failed to unsubscribe push subscription', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authenticated, isLoading, subscription]);

  useEffect(() => {
    // Signing out does not change the token, so without this guard a token
    // resolved just before sign-out would still be registered against the
    // session that just ended.
    if (!registrationToken || !authenticated) {
      return;
    }

    const persistRegistrationToken = async () => {
      const { success, error } = await registerDevice(registrationToken);

      if (!success) {
        console.error('Failed to send registration token', error);
      }
    };

    persistRegistrationToken().catch((error) => {
      console.error('Failed to send registration token', error);
    });
  }, [registrationToken, authenticated]);

  useEffect(() => {
    if (!subscription || !authenticated) {
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
        setRegistrationToken(null);
        return;
      }

      setRegistrationToken(token);
    };

    getRegistrationToken().catch((error) => {
      if (!cancelled) {
        console.error('Failed to get registration token', error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [subscription, registration, authenticated]);

  useEffect(() => {
    if (!registration || !authenticated) {
      return;
    }

    let cancelled = false;

    const initPushStatus = async () => {
      const sub = await registration.pushManager.getSubscription();

      if (!cancelled) {
        // The lookup only seeds the initial state, so it must not undo a
        // subscription the user created while it was still in flight;
        // neither the registration nor the session changes then, which
        // leaves the cleanup above unable to catch it.
        setSubscription((current) => current ?? sub);
      }
    };

    initPushStatus().catch((error) => {
      if (!cancelled) {
        console.error('Failed to get push subscription', error);
      }
    });

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
