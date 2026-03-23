importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyATTrhpkwnoewMyTSPS12VjzuDVJ9tS13E", 
  authDomain: "agbacinema-lab.firebaseapp.com",
  projectId: "agbacinema-lab",
  storageBucket: "agbacinema-lab.appspot.com",
  messagingSenderId: "516184463165", 
  appId: "1:516184463165:web:207aee44448e6f3f3dd754", 
  measurementId: "G-R95672619" 
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || "Agba Cinema Notification";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: payload.notification?.icon || '/agba cinema black.jpg',
    data: {
      url: payload.data?.link || '/admin?tab=communications'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to open the link
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
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
