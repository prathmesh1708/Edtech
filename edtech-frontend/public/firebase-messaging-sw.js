/* Firebase Cloud Messaging service worker — shows push notifications when the app is in the background.
   Config arrives via the registration URL query string (see src/utils/pushNotifications.js). */
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

const params = new URL(self.location).searchParams;
firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
});

const messaging = firebase.messaging();

// Messages with a `notification` payload are displayed by the browser automatically;
// this handles data-only messages.
messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;
  const { title, body } = payload.data || {};
  if (!title) return;
  self.registration.showNotification(title, {
    body,
    icon: '/assets/images/logo.png',
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
