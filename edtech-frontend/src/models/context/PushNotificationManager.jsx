import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { registerPushToken, listenForegroundMessages } from '../../utils/pushNotifications';

// Registers this browser for push once a user is logged in, and surfaces foreground messages.
const PushNotificationManager = () => {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return undefined;

    registerPushToken();

    let unsubscribe = () => {};
    let cancelled = false;
    listenForegroundMessages((payload) => {
      const { title, body } = payload.notification || payload.data || {};
      if (title && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/assets/images/logo.png' });
      }
    }).then((unsub) => {
      if (cancelled) unsub();
      else unsubscribe = unsub;
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [token]);

  return null;
};

export default PushNotificationManager;
