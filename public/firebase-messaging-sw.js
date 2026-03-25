importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyATTrhpkwnoewMyTSPS12VjzuDVJ9tS13E", 
  authDomain: "agba-cinema-platform.firebaseapp.com",
  projectId: "agba-cinema-platform",
  storageBucket: "agba-cinema-platform.firebasestorage.app",
  messagingSenderId: "516184463165", 
  appId: "1:516184463165:web:207aee44448e6f3f3dd754", 
  measurementId: "G-QNTKDDHQ1Q" 
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // The Firebase SDK automatically displays notifications if the payload contains `notification`
  // We only manually show notifications if we are sending data-only pushes
  if (!payload.notification) {
    const notificationTitle = payload.data?.title || "Agba Cinema Alert";
    const notificationOptions = {
      body: payload.data?.body,
      icon: '/icon.png',
      data: {
        url: payload.data?.link || '/admin?tab=communications'
      }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

// Handle notification click to open the link
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Safe extraction of link location
  const urlToOpen = event.notification.data?.url || 
                    event.notification.data?.FCM_MSG?.data?.link || 
                    event.notification.data?.click_action || 
                    '/admin?tab=communications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
