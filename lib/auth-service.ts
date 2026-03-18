import { auth, db, googleProvider } from "./firebase";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export type UserRole = 'super_admin' | 'director' | 'head_of_department' | 'admin' | 'tutor' | 'staff' | 'student' | 'brand';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: any;
}

export const authService = {
  // Google Sign In for all roles
  async signInWithGoogle(role: UserRole = 'student', programType?: string, specialization?: string) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new user profile
        const profile: UserProfile = {
          uid: user.uid,
          name: user.displayName || "New User",
          email: user.email!,
          role: role,
          createdAt: serverTimestamp(),
          ...(role === 'student' && programType ? { programType } : {}),
          ...(role === 'student' && specialization ? { specialization } : {}),
        };
        await setDoc(userRef, profile);
        
        if (role === 'brand') {
          await setDoc(doc(db, "brands", user.uid), {
            brandId: user.uid,
            companyName: user.displayName || "New Company",
            contactPerson: user.displayName || "Contact Name",
            email: user.email!,
            website: "",
            industry: "",
            verified: false
          });
        } else if (role === 'student') {
          const studentId = `AC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          await setDoc(doc(db, "students", user.uid), {
            studentId,
            userId: user.uid,
            studentUID: user.uid,
            fullName: user.displayName || "New Student",
            bio: "",
            skills: [],
            programType: programType || "gopro",
            specialization: specialization || "",
            portfolioLinks: { youtube: "", drive: "", behance: "", website: "" },
            createdAt: serverTimestamp()
          });
        }
      }
      return user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  },

  // Student/Admin Sign Up with Email
  async signUpWithEmail(email: string, pass: string, name: string, role: UserRole = 'student', programType?: string, specialization?: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const user = result.user;
      
      const userRef = doc(db, "users", user.uid);
      const profile: UserProfile = {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: serverTimestamp(),
        ...(role === 'student' && programType ? { programType } : {}),
        ...(role === 'student' && specialization ? { specialization } : {}),
      };
      await setDoc(userRef, profile);

      if (role === 'student') {
        // Create student document with auto-generated ID
        const studentId = `AC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        await setDoc(doc(db, "students", user.uid), {
          studentId,
          userId: user.uid,
          studentUID: user.uid,
          fullName: name,
          bio: "",
          skills: [],
          programType: programType || "gopro",
          specialization: specialization || "",
          portfolioLinks: {
            youtube: "",
            drive: "",
            behance: "",
            website: ""
          },
          createdAt: serverTimestamp()
        });
      }
      
      return user;
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  },

  async login(email: string, pass: string) {
    return signInWithEmailAndPassword(auth, email, pass);
  },

  async logout() {
    return signOut(auth);
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  },

  async verifyPassword(password: string) {
    if (!auth.currentUser || !auth.currentUser.email) return false;
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      return true;
    } catch (error) {
      console.error("Password verification failed", error);
      return false;
    }
  }
};
