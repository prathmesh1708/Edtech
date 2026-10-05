import { getMessaging, getToken, deleteToken, onMessage, isSupported } from 'firebase/messaging';
import api from '../models/services/api';
import { firebaseConfig, VAPID_KEY, isFirebaseConfigured, getFirebaseApp } from '../config/firebase';

const FCM_TOKEN_KEY = 'sw_fcm_token';

const canUsePush = async () =>
  isFirebaseConfigured && !!VAPID_KEY && 'Notification' in window && (await isSupported());

// The service worker can't read import.meta.env, so the public config is passed in its URL.
const registerServiceWorker = () => {
  const params = new URLSearchParams(
    Object.entries(firebaseConfig).filter(([, v]) => v)
  ).toString();
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params}`);
};

/**
 * Asks for notification permission, gets this browser's FCM token and saves it
 * to the logged-in user via POST /api/auth/fcm-token. Safe to call repeatedly.
 */
export const registerPushToken = async () => {
  try {
    if (!(await canUsePush())) return null;
    if (Notification.permission === 'denied') return null;

    const permission =
      Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const registration = await registerServiceWorker();
    const messaging = getMessaging(getFirebaseApp());
    const fcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!fcmToken) return null;

    await api.post('/auth/fcm-token', { fcmToken, deviceType: 'web' });
    localStorage.setItem(FCM_TOKEN_KEY, fcmToken);
    return fcmToken;
  } catch (error) {
    console.warn('Push notification setup failed:', error);
    return null;
  }
};

/** Removes this browser's token from the server and Firebase. Call before clearing the session. */
export const unregisterPushToken = async () => {
  const fcmToken = localStorage.getItem(FCM_TOKEN_KEY);
  const authToken = localStorage.getItem('sw_token'); // read now: logout clears it right after
  if (!fcmToken) return;
  localStorage.removeItem(FCM_TOKEN_KEY);
  try {
    await api.delete('/auth/fcm-token', {
      data: { fcmToken },
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (await canUsePush()) await deleteToken(getMessaging(getFirebaseApp()));
  } catch (error) {
    console.warn('Push token cleanup failed:', error);
  }
};

/** Subscribes to messages that arrive while the tab is open. Returns an unsubscribe function. */
export const listenForegroundMessages = async (callback) => {
  if (!(await canUsePush())) return () => {};
  return onMessage(getMessaging(getFirebaseApp()), callback);
};
