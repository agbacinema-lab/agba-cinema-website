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
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/agba cinema black.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
