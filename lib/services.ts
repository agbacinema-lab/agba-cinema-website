import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { 
  PortfolioItem, 
  StudentProfile, 
  BrandProfile, 
  PortfolioReview, 
  InternshipRequest, 
  UserProfile,
  AdminProfile,
  ApprovalRequest
} from "./types";

// BLOG SERVICE
export const blogService = {
  getAllPosts: async (): Promise<BlogPost[]> => {
    const postsCol = collection(db, "posts");
    const postsSnapshot = await getDocs(query(postsCol, orderBy("publishedAt", "desc")));
    return postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
  },

  getPostBySlug: async (slug: string): Promise<BlogPost | null> => {
    const postsCol = collection(db, "posts");
    const q = query(postsCol, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as BlogPost;
  }
};

// PORTFOLIO SERVICE
export const portfolioService = {
  getAllItems: async (): Promise<PortfolioItem[]> => {
    const itemsCol = collection(db, "portfolio");
    const itemsSnapshot = await getDocs(query(itemsCol, orderBy("year", "desc")));
    return itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
  }
};

// ADMIN SERVICE
export const adminService = {
  getAllUsers: async (): Promise<UserProfile[]> => {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(query(usersCol, orderBy("createdAt", "desc")));
    return snapshot.docs.map(doc => doc.data() as UserProfile);
  },

  promoteToAdmin: async (userId: string, type: 'tutor' | 'staff' | 'both'): Promise<void> => {
    await updateDoc(doc(db, "users", userId), { role: 'admin' });
    await setDoc(doc(db, "admins", userId), {
      userId,
      type,
      permissions: {
        reviewPortfolio: true,
        approveStudents: true,
        assignProjects: type === 'both' || type === 'staff',
        manageBrands: type === 'both' || type === 'staff'
      }
    });
  },

  demoteFromAdmin: async (userId: string, newRole: 'student' | 'staff' | 'tutor' = 'student'): Promise<void> => {
    await updateDoc(doc(db, "users", userId), { role: newRole });
    await deleteDoc(doc(db, "admins", userId));
  },

  updateUserRole: async (userId: string, newRole: any): Promise<void> => {
    await updateDoc(doc(db, "users", userId), { role: newRole });
  },

  upgradeBrandAccess: async (userId: string): Promise<void> => {
    await updateDoc(doc(db, "users", userId), { hasPaidAccess: true });
    await updateDoc(doc(db, "brands", userId), { hasPaidAccess: true });
  },

  createApprovalRequest: async (request: Omit<ApprovalRequest, 'id' | 'status' | 'createdAt'>): Promise<void> => {
    const approvalsCol = collection(db, "approvals");
    await addDoc(approvalsCol, {
      ...request,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  },

  getPendingApprovals: async (): Promise<ApprovalRequest[]> => {
    const approvalsCol = collection(db, "approvals");
    const q = query(approvalsCol, where("status", "==", "pending"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApprovalRequest));
  },

  processApproval: async (id: string, approved: boolean): Promise<void> => {
    const approvalRef = doc(db, "approvals", id);
    const snap = await getDoc(approvalRef);
    if (!snap.exists()) return;

    const request = snap.data() as ApprovalRequest;

    if (approved) {
      if (request.type === 'role_change') {
        await updateDoc(doc(db, "users", request.data.userId), { role: request.data.targetRole });
      } else if (request.type === 'internship_ready') {
        const studentRef = collection(db, "students");
        const q = query(studentRef, where("studentUID", "==", request.data.userId));
        const sSnap = await getDocs(q);
        if (!sSnap.empty) {
          await updateDoc(sSnap.docs[0].ref, { status: 'internship_ready' });
        }
      }
      await updateDoc(approvalRef, { status: 'approved' });
    } else {
      await updateDoc(approvalRef, { status: 'rejected' });
    }
  },

  togglePermission: async (userId: string, permission: string, value: boolean): Promise<void> => {
    const adminRef = doc(db, "admins", userId);
    await updateDoc(adminRef, {
      [`permissions.${permission}`]: value
    });
  }
};

// STUDENT SERVICE
export const studentService = {
  getStudentProfile: async (userId: string): Promise<StudentProfile | null> => {
    const snap = await getDoc(doc(db, "students", userId));
    return snap.exists() ? snap.data() as StudentProfile : null;
  },

  updatePortfolio: async (userId: string, links: Partial<StudentProfile['portfolioLinks']>): Promise<void> => {
    await updateDoc(doc(db, "students", userId), {
      portfolioLinks: links
    });
  },

  getAllTalent: async (isPremiumOnly = false): Promise<StudentProfile[]> => {
    const studentsCol = collection(db, "students");
    let q = query(studentsCol, where("status", "==", "internship_ready"));
    if (isPremiumOnly) {
      q = query(q, where("programType", "==", "mentorship"));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as StudentProfile);
  }
};

// BRAND SERVICE
export const brandService = {
  requestInternship: async (brandId: string, studentId: string): Promise<string> => {
    const requestsCol = collection(db, "internship_requests");
    const docRef = await addDoc(requestsCol, {
      brandId,
      studentId,
      status: 'pending',
      requestedAt: serverTimestamp()
    });
    // Cloud function would trigger email here
    return docRef.id;
  },

  getBrandProfile: async (userId: string): Promise<BrandProfile | null> => {
    const snap = await getDoc(doc(db, "brands", userId));
    return snap.exists() ? snap.data() as BrandProfile : null;
  }
};

// REVIEW SERVICE
export const reviewService = {
  submitReview: async (review: Omit<PortfolioReview, 'reviewId' | 'createdAt'>): Promise<void> => {
    const reviewsCol = collection(db, "portfolio_reviews");
    await addDoc(reviewsCol, {
      ...review,
      createdAt: serverTimestamp()
    });
  }
};

// LMS (Learning Management System) SERVICE
export const lmsService = {
  // Classes
  createClassSession: async (session: Omit<any, 'id' | 'date'>): Promise<void> => {
    const classesCol = collection(db, "classes");
    await addDoc(classesCol, {
      ...session,
      date: serverTimestamp()
    });
  },

  getAllClasses: async (): Promise<{}[]> => {
    const classesCol = collection(db, "classes");
    const snapshot = await getDocs(query(classesCol, orderBy("date", "desc")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Assignments
  createAssignment: async (assignment: Omit<any, 'id' | 'createdAt'>): Promise<void> => {
    const assignmentsCol = collection(db, "assignments");
    await addDoc(assignmentsCol, {
      ...assignment,
      createdAt: serverTimestamp()
    });
  },

  getAssignments: async (subject?: string): Promise<{}[]> => {
    const assignmentsCol = collection(db, "assignments");
    let q = query(assignmentsCol, orderBy("createdAt", "desc"));
    if (subject) q = query(assignmentsCol, where("subject", "==", subject), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  toggleAssignmentStatus: async (id: string, isOpen: boolean): Promise<void> => {
    await updateDoc(doc(db, "assignments", id), { isOpen });
  },

  // Submissions
  submitAssignment: async (submission: Omit<any, 'id' | 'status' | 'submittedAt'>): Promise<void> => {
    const submissionsCol = collection(db, "submissions");
    await addDoc(submissionsCol, {
      ...submission,
      status: 'pending',
      submittedAt: serverTimestamp()
    });
  },

  getSubmissionsByAssignment: async (assignmentId: string): Promise<{}[]> => {
    const submissionsCol = collection(db, "submissions");
    const snapshot = await getDocs(query(submissionsCol, where("assignmentId", "==", assignmentId), orderBy("submittedAt", "desc")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getSubmissionsByStudent: async (studentUID: string): Promise<{}[]> => {
    const submissionsCol = collection(db, "submissions");
    const snapshot = await getDocs(query(submissionsCol, where("studentUID", "==", studentUID), orderBy("submittedAt", "desc")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  gradeSubmission: async (id: string, status: 'approved' | 'redo', grade?: number, tutorComment?: string): Promise<void> => {
    await updateDoc(doc(db, "submissions", id), {
      status,
      grade: grade || null,
      tutorComment: tutorComment || "",
      gradedAt: serverTimestamp()
    });
  }
};

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  image: string
  category: string
  tags: string[]
  author: string
  publishedAt: string
  readTime: string
}

