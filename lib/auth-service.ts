import { auth, db, googleProvider } from "./firebase";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { adminService, notificationService, notifySuperAdmins } from "./services";

import { UserRole, UserProfile } from "./types";
export { type UserRole, type UserProfile } from "./types";

export const authService = {
  // Google Sign In for all roles
  async signInWithGoogle(role: UserRole = 'student', programType?: string, specialization?: string, cohort?: string) {
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
          ...( ['staff', 'tutor', 'hod', 'director', 'admin'].includes(role) ? { approvalStatus: 'pending' } : {}),
          ...(role === 'student' && programType ? { programType } : {}),
          ...(role === 'student' && specialization ? { specialization } : {}),
          ...(role === 'student' && cohort ? { cohort } : {}),
          ...(role === 'student' ? { studentId: `stu_${Math.floor(100000 + Math.random() * 900000)}` } : {}),
          ...(role === 'tutor' ? { tutorId: `tut_${Math.floor(100000 + Math.random() * 900000)}` } : {}),
        };
        await setDoc(userRef, profile);
        
        // --- NOTIFICATION HANDLER ---
        try {
          if (role === 'staff') {
            // Create staff approval request in Firestore
            const approvalRef = doc(db, 'staff_approvals', user.uid);
            await setDoc(approvalRef, {
              staffUid: user.uid,
              staffName: profile.name,
              staffEmail: profile.email,
              status: 'pending',
              createdAt: serverTimestamp(),
            });
            // Notify superadmins in-app
            await notifySuperAdmins(
              `🆕 Staff Registration Pending Approval`,
              `${profile.name} (${profile.email}) has registered as staff and is awaiting your approval.`,
              'staff_approval_request',
              { staffUid: profile.uid, staffName: profile.name, staffEmail: profile.email, requestId: user.uid }
            ).catch(e => console.error("Platform Broadcast Error:", e));
            // Email superadmin
            await fetch("/api/notifications/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to_email: "agbacinema@gmail.com",
                to_name: "Super Admin",
                subject: `🆕 New Staff Registration – Approval Required: ${profile.name}`,
                message: `A new staff member has registered and is awaiting your approval. Please log in to the admin panel to review and approve or reject their account.`,
                template_params: {
                  user_name: profile.name,
                  user_email: profile.email,
                  user_id: profile.uid,
                  role: 'staff',
                  status: 'PENDING APPROVAL',
                  action: 'Log in to Admin Panel → User Management → Staff Approvals'
                }
              })
            }).catch(e => console.error("Staff Approval Email Error:", e));
          } else {
            const settings = await adminService.getSettings();
            if (settings?.notifications?.studentJoining && (role === 'student' || role === 'brand')) {
              await fetch("/api/notifications/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  to_email: "agbacinema@gmail.com",
                  to_name: "Admin",
                  subject: `NEW ${role.toUpperCase()} ENROLLED: ${profile.name}`,
                  message: `${profile.name} has just registered as a ${role}. Protocol initiated.`,
                  template_params: {
                    user_name: profile.name,
                    user_email: profile.email,
                    user_id: profile.uid,
                    role: role,
                    intent: role === 'student' ? 'Education / Academy' : 'Partnership / Brand'
                  }
                })
              }).catch(e => console.error("Signal Broadcast Error:", e));
            }

            // --- WELCOME EMAIL TO USER ---
            await fetch("/api/notifications/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to_email: profile.email,
                to_name: profile.name,
                subject: `Welcome to ÀGBÀ CINEMA: Protocol Initiated 🎬`,
                message: `Your account has been successfully generated. ${String(role) === 'staff' ? 'Your access is currently pending administrative review.' : 'You now have access to your personal portal.'}`,
                template_params: {
                  role: role.toUpperCase(),
                  status: String(role) === 'staff' ? 'PENDING REVIEW' : 'ACTIVE',
                  mission: "Begin your creative trajectory today."
                }
              })
            }).catch(e => console.error("Welcome Email Error:", e));

            await notifySuperAdmins(
              `NEW ${role.toUpperCase()} ENROLLED`,
              `${profile.name} (${profile.email}) has joined as a ${role}.`,
              'new_registration',
              { userId: profile.uid, role }
            ).catch(e => console.error("Platform Broadcast Error:", e));
          }
        } catch (e) {
          console.error("Critical Settings Access Failure:", e);
        }
        // --- END NOTIFICATION HANDLER ---
        
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
          await setDoc(doc(db, "students", user.uid), {
            studentId: (profile as any).studentId,
            userId: user.uid,
            studentUID: user.uid,
            fullName: user.displayName || "New Student",
            bio: "",
            skills: [],
            programType: programType || "gopro",
            specialization: specialization || "",
            cohort: cohort || "",
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
  async signUpWithEmail(email: string, pass: string, name: string, role: UserRole = 'student', programType?: string, specialization?: string, cohort?: string) {
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
        ...( ['staff', 'tutor', 'hod', 'director', 'admin'].includes(role) ? { approvalStatus: 'pending' } : {}),
        ...(role === 'student' && programType ? { programType } : {}),
        ...(role === 'student' && specialization ? { specialization } : {}),
        ...(role === 'student' && cohort ? { cohort } : {}),
        ...(role === 'student' ? { studentId: `stu_${Math.floor(100000 + Math.random() * 900000)}` } : {}),
        ...(role === 'tutor' ? { tutorId: `tut_${Math.floor(100000 + Math.random() * 900000)}` } : {}),
      };
      await setDoc(userRef, profile);
 
      // --- NOTIFICATION HANDLER ---
      try {
        if (role === 'staff') {
          // Create staff approval request in Firestore
          const approvalRef = doc(db, 'staff_approvals', user.uid);
          await setDoc(approvalRef, {
            staffUid: user.uid,
            staffName: profile.name,
            staffEmail: profile.email,
            status: 'pending',
            createdAt: serverTimestamp(),
          });
          // Notify superadmins in-app
          await notifySuperAdmins(
            `🆕 Staff Registration Pending Approval`,
            `${profile.name} (${profile.email}) has registered as staff and is awaiting your approval.`,
            'staff_approval_request',
            { staffUid: profile.uid, staffName: profile.name, staffEmail: profile.email, requestId: user.uid }
          ).catch((e: any) => console.error("Platform Broadcast Error:", e));
          // Email superadmin
          await fetch("/api/notifications/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to_email: "agbacinema@gmail.com",
              to_name: "Super Admin",
              subject: `🆕 New Staff Registration – Approval Required: ${profile.name}`,
              message: `A new staff member has registered and is awaiting your approval. Please log in to the admin panel to review and approve or reject their account.`,
              template_params: {
                user_name: profile.name,
                user_email: profile.email,
                user_id: profile.uid,
                role: 'staff',
                status: 'PENDING APPROVAL',
                action: 'Log in to Admin Panel → User Management → Staff Approvals'
              }
            })
          }).catch((e: any) => console.error("Staff Approval Email Error:", e));
        } else {
          const settings = await adminService.getSettings();
          if (settings?.notifications?.studentJoining && (role === 'student' || role === 'brand')) {
            await fetch("/api/notifications/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to_email: "agbacinema@gmail.com",
                to_name: "Admin",
                subject: `NEW ${role.toUpperCase()} ENROLLED: ${profile.name}`,
                message: `${profile.name} has just registered as a ${role}. Protocol initiated.`,
                template_params: {
                  user_name: profile.name,
                  user_email: profile.email,
                  user_id: profile.uid,
                  role: role,
                  intent: role === 'student' ? 'Education / Academy' : 'Partnership / Brand'
                }
              })
            }).catch((e: any) => console.error("Signal Broadcast Error:", e));
          }
        }

        // --- WELCOME EMAIL TO USER (All roles) ---
        await fetch("/api/notifications/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to_email: email,
            to_name: name,
            subject: `Welcome to ÀGBÀ CINEMA: Protocol Initiated 🎬`,
            message: `Your account has been successfully generated. ${String(role) === 'staff' ? 'Your access is currently pending administrative review.' : 'You now have access to your personal portal.'}`,
            template_params: {
              role: role.toUpperCase(),
              status: String(role) === 'staff' ? 'PENDING REVIEW' : 'ACTIVE',
              mission: "Begin your creative trajectory today."
            }
          })
        }).catch(e => console.error("Welcome Email Error:", e));

        await notifySuperAdmins(
          `NEW ${role.toUpperCase()} ENROLLED`,
          `${profile.name} (${profile.email}) has joined as a ${role}.`,
          'new_registration',
          { userId: profile.uid, role }
        ).catch((e: any) => console.error("Platform Broadcast Error:", e));
      } catch (e) {
        console.error("Critical Settings Access Failure:", e);
      }
      // --- END NOTIFICATION HANDLER ---
 
      if (role === 'student') {
        await setDoc(doc(db, "students", user.uid), {
          studentId: (profile as any).studentId,
          userId: user.uid,
          studentUID: user.uid,
          fullName: name,
          bio: "",
          skills: [],
          programType: programType || "gopro",
          specialization: specialization || "",
          cohort: cohort || "",
          portfolioLinks: { youtube: "", drive: "", behance: "", website: "" },
          createdAt: serverTimestamp()
        });
      } else if (role === 'brand') {
        await setDoc(doc(db, "brands", user.uid), {
          brandId: user.uid,
          companyName: name || "New Company",
          contactPerson: name || "Contact Name",
          email: email,
          website: "",
          industry: "",
          verified: false,
          hasPaidAccess: false,
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
  },

  async resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }
};
