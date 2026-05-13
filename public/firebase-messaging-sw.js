// Firebase Cloud Messaging Service Worker
// Place this file at: frontend/public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase (replace with your config)
firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || "",
  authDomain: self.FIREBASE_AUTH_DOMAIN || "",
  projectId: self.FIREBASE_PROJECT_ID || "",
  storageBucket: self.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: self.FIREBASE_APP_ID || "",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message:', payload);

  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || 'KisanSathi', {
    body: body || 'You have a new farming alert',
    icon: icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: payload.data,
    actions: [
      { action: 'view', title: 'View Dashboard' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view' || !event.action) {
    event.waitUntil(clients.openWindow('/dashboard'));
  }
});
