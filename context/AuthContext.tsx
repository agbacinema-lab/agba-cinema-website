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
    
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // 1. Real-time profile listener
        const userRef = doc(db, "users", firebaseUser.uid);
        unsubscribeProfile = onSnapshot(userRef, async (userSnap) => {
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setProfile(data);

            // Auto-repair missing Student ID
            if (data.role === 'student' && !(data as any).studentId) {
               try {
                 const { studentService } = await import('@/lib/services');
                 const sync = await studentService.getStudentByUserId(firebaseUser.uid);
                 if (sync?.studentId) {
                    const { updateDoc } = await import('firebase/firestore');
                    await updateDoc(userRef, { studentId: sync.studentId });
                    console.log("[AUTH REPAIR] Student ID synced to login profile.");
                 }
               } catch (e) {
                 console.warn("[AUTH REPAIR] Sync failed:", e);
               }
            }
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("Profile Listener Error:", err);
          setLoading(false);
        });
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
  
  // ── Separate Effect for FCM Setup ──
  useEffect(() => {
    if (!user) return;

    const setupFCM = async () => {
      try {
        const { getMessagingInstance } = await import("@/lib/firebase");
        const messagingInstance = await getMessagingInstance();
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
        
        if (messagingInstance && vapidKey) {
          console.log("[FCM] Messaging ready. Requesting token...");
          const { getToken, onMessage } = await import("firebase/messaging");
          
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            await navigator.serviceWorker.ready;

            const token = await getToken(messagingInstance, { 
              vapidKey,
              serviceWorkerRegistration: registration
            });
            
            if (token) {
              const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
              const tokenRef = doc(db, "users", user.uid, "fcm_tokens", token);
              await setDoc(tokenRef, {
                token,
                platform: window.navigator.userAgent.includes("Mobi") ? "mobile" : "web",
                lastUsed: serverTimestamp()
              }, { merge: true });
              console.log("[FCM] Registered token in Firestore.");
            }
          }

          onMessage(messagingInstance, async (payload) => {
            console.log("[FCM] Foreground message:", payload);
            const { toast } = await import("sonner");
            toast(payload.notification?.title || "Notification", {
              description: payload.notification?.body,
              action: payload.data?.link ? {
                label: "View",
                onClick: () => window.location.href = payload.data?.link as string
              } : undefined
            });
          });
        }
      } catch (e: any) {
        if (e.code !== 'messaging/permission-blocked') {
          console.error("[FCM] Setup error:", e);
        }
      }
    };

    setupFCM();
  }, [user]);

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
