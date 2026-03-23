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

        // 2. FCM Token Registration
        try {
          const { messaging } = await import("@/lib/firebase");
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
          
          if (messaging && vapidKey) {
            const { getToken } = await import("firebase/messaging");
            const token = await getToken(messaging, { vapidKey });
            
            if (token) {
              const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
              const tokenRef = doc(db, "users", firebaseUser.uid, "fcm_tokens", token);
              await setDoc(tokenRef, {
                token,
                platform: window.navigator.userAgent.includes("Mobi") ? "mobile" : "web",
                lastUsed: serverTimestamp()
              }, { merge: true });
            }
          } else if (!vapidKey) {
            console.warn("[FCM] NEXT_PUBLIC_VAPID_KEY missing. Push notifications disabled.");
          }
        } catch (e: any) {
          if (e.code === 'messaging/permission-blocked') {
            console.log("[FCM] Notifications blocked by user.");
          } else {
            console.warn("[FCM] Token registration failed:", e);
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
