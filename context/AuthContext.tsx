"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStudent: boolean;
  isBrand: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
  isStudent: false,
  isBrand: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // 1. Real-time profile listener
        const userRef = doc(db, "users", firebaseUser.uid);
        unsubscribeProfile = onSnapshot(userRef, (userSnap) => {
          if (userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("Profile Listener Error:", err);
          setLoading(false);
        });

        // 2. FCM Token Registration & Messaging Setup
        try {
          const { messaging } = await import("@/lib/firebase");
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
          
          if (messaging && vapidKey) {
            const { getToken, onMessage } = await import("firebase/messaging");
            
            // Explicitly register service worker to ensure it's available for getToken
            if ('serviceWorker' in navigator) {
              const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
              
              const token = await getToken(messaging, { 
                vapidKey,
                serviceWorkerRegistration: registration
              });
              
              if (token) {
                const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
                const tokenRef = doc(db, "users", firebaseUser.uid, "fcm_tokens", token);
                await setDoc(tokenRef, {
                  token,
                  platform: window.navigator.userAgent.includes("Mobi") ? "mobile" : "web",
                  lastUsed: serverTimestamp()
                }, { merge: true });
                console.log("[FCM] Token secured and registered.");
              }
            }

            // Listen for foreground messages
            onMessage(messaging, async (payload) => {
              console.log("[FCM] Foreground message received:", payload);
              // Trigger a toast for foreground messages
              const { toast } = await import("sonner");
              toast(payload.notification?.title || "New Notification", {
                description: payload.notification?.body,
                action: payload.data?.link ? {
                  label: "View",
                  onClick: () => window.location.href = payload.data?.link as string
                } : undefined
              });
            });

          } else if (!vapidKey) {
            console.warn("[FCM] NEXT_PUBLIC_VAPID_KEY missing. Push notifications disabled.");
          }
        } catch (e: any) {
          if (e.code === 'messaging/permission-blocked') {
            console.log("[FCM] Notifications blocked by user.");
          } else {
            console.warn("[FCM] Messaging setup failed:", e);
          }
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) (unsubscribeProfile as () => void)();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
    isSuperAdmin: profile?.role === 'super_admin',
    isStudent: profile?.role === 'student',
    isBrand: profile?.role === 'brand',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
