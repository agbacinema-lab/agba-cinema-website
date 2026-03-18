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
  ApprovalRequest,
  BrandMeeting,
  PerformanceFeedback,
  Announcement
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
  },
  createItem: async (data: any): Promise<void> => {
    const itemsCol = collection(db, "portfolio");
    await addDoc(itemsCol, { ...data, createdAt: serverTimestamp() });
  },
  updateItem: async (id: string, data: any): Promise<void> => {
    await updateDoc(doc(db, "portfolio", id), { ...data, updatedAt: serverTimestamp() });
  },
  deleteItem: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "portfolio", id));
  }
};

// EVENT SERVICE
export const eventService = {
  getAllEvents: async (): Promise<any[]> => {
    const col = collection(db, "events");
    const snapshot = await getDocs(col);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  createEvent: async (data: any): Promise<void> => {
    const col = collection(db, "events");
    await addDoc(col, { ...data, createdAt: serverTimestamp() });
  },
  updateEvent: async (id: string, data: any): Promise<void> => {
    await updateDoc(doc(db, "events", id), { ...data, updatedAt: serverTimestamp() });
  },
  deleteEvent: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "events", id));
  }
};

// ACADEMY SERVICE
export const academyService = {
  getAllServices: async (): Promise<any[]> => {
    const col = collection(db, "academy_services");
    const snapshot = await getDocs(col);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  createService: async (data: any): Promise<void> => {
    const col = collection(db, "academy_services");
    await addDoc(col, { ...data, createdAt: serverTimestamp() });
  },
  updateService: async (id: string, data: any): Promise<void> => {
    await updateDoc(doc(db, "academy_services", id), { ...data, updatedAt: serverTimestamp() });
  },
  deleteService: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "academy_services", id));
  }
};

// ADMIN SERVICE
export const adminService = {
  getAllUsers: async (): Promise<UserProfile[]> => {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(query(usersCol, orderBy("createdAt", "desc")));
    return snapshot.docs.map(doc => doc.data() as UserProfile);
  },

  getUserById: async (id: string): Promise<UserProfile | null> => {
    // If it's a student or tutor ID (public format)
    if (id.startsWith('stu_') || id.startsWith('tut_')) {
      const field = id.startsWith('stu_') ? 'studentId' : 'tutorId'
      const q = query(collection(db, "users"), where(field, "==", id), limit(1))
      const snap = await getDocs(q)
      if (snap.empty) return null
      return snap.docs[0].data() as UserProfile
    }
    
    // Otherwise assume it's a Firebase UID
    const snap = await getDoc(doc(db, "users", id));
    return snap.exists() ? snap.data() as UserProfile : null;
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
  },

  getAnnouncements: async (): Promise<Announcement[]> => {
    const col = collection(db, "announcements");
    const snapshot = await getDocs(query(col, orderBy("createdAt", "desc")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
  },

  createAnnouncement: async (ann: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const col = collection(db, "announcements");
    const docRef = await addDoc(col, {
       ...ann,
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  updateAnnouncement: async (id: string, data: Partial<Announcement>): Promise<void> => {
    await updateDoc(doc(db, "announcements", id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "announcements", id));
  },

  getSalesStats: async () => {
    const col = collection(db, "payments");
    const q = query(col, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    
    const raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const totalRevenue = raw.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const count = raw.length;
    
    return { totalRevenue, count, transactions: raw };
  },

  logPayment: async (data: any) => {
    const col = collection(db, "payments");
    await addDoc(col, {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  getEngagementData: async () => {
    // Basic engagement tracking based on user roles and registrations for now
    const users = await adminService.getAllUsers();
    return {
       totalUsers: users.length,
       students: users.filter(u => u.role === 'student').length,
       brands: users.filter(u => u.role === 'brand').length,
       staff: users.filter(u => u.role !== 'student' && u.role !== 'brand').length
    };
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
  updateFullProfile: async (studentId: string, data: any): Promise<void> => {
    // Using setDoc with merge: true ensures the doc is created if it doesn't exist
    await setDoc(doc(db, "users", studentId), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  },

  // Assign a tutor to a student (super admin only)
  assignTutorToStudent: async (studentId: string, tutorId: string, tutorName: string): Promise<void> => {
    await setDoc(doc(db, "users", studentId), { tutorId, tutorName, updatedAt: serverTimestamp() }, { merge: true });
  },

  // Get all students assigned to a given tutor
  getStudentsByTutor: async (tutorId: string): Promise<any[]> => {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("tutorId", "==", tutorId), where("role", "==", "student"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
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
  requestInternship: async (request: Omit<InternshipRequest, 'requestId' | 'status' | 'requestedAt'>): Promise<string> => {
    const requestsCol = collection(db, "internship_requests");
    const docRef = await addDoc(requestsCol, {
      ...request,
      status: 'pending',
      requestedAt: serverTimestamp()
    });
    return docRef.id;
  },

  submitInternRequirements: async (brandId: string, requirements: string): Promise<void> => {
    await updateDoc(doc(db, "brands", brandId), {
      requirements,
      updatedAt: serverTimestamp()
    });
  },

  bookMeeting: async (meeting: Omit<BrandMeeting, 'meetingId' | 'status'>): Promise<string> => {
    const meetingsCol = collection(db, "brand_meetings");
    const docRef = await addDoc(meetingsCol, {
      ...meeting,
      status: 'pending'
    });
    return docRef.id;
  },

  getBrandProfile: async (userId: string): Promise<BrandProfile | null> => {
    const snap = await getDoc(doc(db, "brands", userId));
    return snap.exists() ? snap.data() as BrandProfile : null;
  },

  getActiveInternships: async (brandId: string): Promise<InternshipRequest[]> => {
    const q = query(
      collection(db, "internship_requests"), 
      where("brandId", "==", brandId), 
      where("status", "==", "assigned")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ requestId: doc.id, ...doc.data() } as InternshipRequest));
  },

  getBrandRequests: async (brandId: string): Promise<InternshipRequest[]> => {
    const q = query(
      collection(db, "internship_requests"), 
      where("brandId", "==", brandId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ requestId: doc.id, ...doc.data() } as InternshipRequest));
  },

  submitFeedback: async (requestId: string, rating: number, comment: string): Promise<void> => {
    const requestRef = doc(db, "internship_requests", requestId);
    await updateDoc(requestRef, {
      feedback: {
        rating,
        comment,
        submittedAt: serverTimestamp()
      }
    });
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

// CURRICULUM SERVICE
export const curriculumService = {
  // Get all curricula
  getAllCurricula: async (): Promise<any[]> => {
    const curriculaCol = collection(db, "curricula");
    const snapshot = await getDocs(query(curriculaCol, orderBy("createdAt", "desc")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get curricula by program type
  getCurriculaByProgram: async (programType: string): Promise<any[]> => {
    const curriculaCol = collection(db, "curricula");
    const q = query(curriculaCol, where("programType", "==", programType));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    return docs.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
  },

  // Get a single curriculum
  getCurriculumById: async (curriculumId: string): Promise<any | null> => {
    const curriculumDoc = await getDoc(doc(db, "curricula", curriculumId));
    if (!curriculumDoc.exists()) return null;
    return { id: curriculumDoc.id, ...curriculumDoc.data() };
  },

  // Create a new curriculum
  createCurriculum: async (curriculumData: any): Promise<string> => {
    const curriculaCol = collection(db, "curricula");
    const docRef = await addDoc(curriculaCol, {
      ...curriculumData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update curriculum
  updateCurriculum: async (curriculumId: string, data: any): Promise<void> => {
    await updateDoc(doc(db, "curricula", curriculumId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  // Delete curriculum
  deleteCurriculum: async (curriculumId: string): Promise<void> => {
    await deleteDoc(doc(db, "curricula", curriculumId));
  },

  // Get curriculum modules for a specific curriculum
  getModulesByCurriculum: async (curriculumId: string): Promise<any[]> => {
    const modulesCol = collection(db, "curricula", curriculumId, "modules");
    const q = query(modulesCol, orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Create a new module inside a curriculum
  createModule: async (curriculumId: string, moduleData: any): Promise<string> => {
    const modulesCol = collection(db, "curricula", curriculumId, "modules");
    // Assign order based on current count
    const snapshot = await getDocs(modulesCol);
    const order = snapshot.size + 1;
    
    // Update parent moduleCount
    const curriculumRef = doc(db, "curricula", curriculumId);
    await updateDoc(curriculumRef, { moduleCount: order });

    const docRef = await addDoc(modulesCol, {
      ...moduleData,
      order,
      moduleNumber: order,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update a module
  updateModule: async (curriculumId: string, moduleId: string, data: any): Promise<void> => {
    const moduleRef = doc(db, "curricula", curriculumId, "modules", moduleId);
    await updateDoc(moduleRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  // Delete a module
  deleteModule: async (curriculumId: string, moduleId: string): Promise<void> => {
    await deleteDoc(doc(db, "curricula", curriculumId, "modules", moduleId));
    // Optional: decrement moduleCount but for simplicity we ignore it
  },

  // Get curriculum modules for a specific specialization (legacy support)
  getModulesBySpecialization: async (specialization: string): Promise<any[]> => {
    const modulesCol = collection(db, "curriculumModules");
    const q = query(
      modulesCol,
      where("specialization", "==", specialization),
      orderBy("order", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get a single module with all materials
  getModuleById: async (curriculumId: string, moduleId: string): Promise<any | null> => {
    const moduleDoc = await getDoc(doc(db, "curricula", curriculumId, "modules", moduleId));
    if (!moduleDoc.exists()) return null;
    return { id: moduleDoc.id, ...moduleDoc.data() };
  },

  // Add learning material to a module
  addLearningMaterial: async (curriculumId: string, moduleId: string, material: any): Promise<string> => {
    const materialsCol = collection(db, "curricula", curriculumId, "modules", moduleId, "materials");
    const docRef = await addDoc(materialsCol, {
      ...material,
      uploadedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Get all materials for a module
  getMaterialsByModule: async (curriculumId: string, moduleId: string): Promise<any[]> => {
    const materialsCol = collection(db, "curricula", curriculumId, "modules", moduleId, "materials");
    const snapshot = await getDocs(query(materialsCol, orderBy("uploadedAt", "desc")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Delete learning material
  deleteMaterial: async (curriculumId: string, moduleId: string, materialId: string): Promise<void> => {
    await deleteDoc(doc(db, "curricula", curriculumId, "modules", moduleId, "materials", materialId));
  },

  // Get student progress
  getStudentProgress: async (studentUID: string, specialization: string): Promise<any | null> => {
    const progressCol = collection(db, "studentProgress");
    const q = query(
      progressCol,
      where("studentId", "==", studentUID),
      where("specialization", "==", specialization),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  },

  // Update student progress (mark module as completed)
  updateModuleProgress: async (studentUID: string, specialization: string, moduleId: string): Promise<void> => {
    const progressCol = collection(db, "studentProgress");
    const q = query(
      progressCol,
      where("studentId", "==", studentUID),
      where("specialization", "==", specialization),
      limit(1)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const docRef = doc(db, "studentProgress", snapshot.docs[0].id);
      const currentData = snapshot.docs[0].data();
      await updateDoc(docRef, {
        completedModules: [...(currentData.completedModules || []), moduleId],
        lastAccessedAt: serverTimestamp()
      });
    }
  }
};

// ASSIGNMENT SERVICE
export const assignmentService = {
  // Get all assignments
  getAllAssignments: async (): Promise<any[]> => {
    const assignmentsCol = collection(db, "assignments");
    const snapshot = await getDocs(query(assignmentsCol, orderBy("createdAt", "desc")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get assignments by program type
  getAssignmentsByProgram: async (programType: string): Promise<any[]> => {
    const assignmentsCol = collection(db, "assignments");
    const q = query(assignmentsCol, where("programType", "==", programType), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get assignments by curriculum
  getAssignmentsByCurriculum: async (curriculumId: string): Promise<any[]> => {
    const assignmentsCol = collection(db, "assignments");
    const q = query(assignmentsCol, where("curriculumId", "==", curriculumId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get single assignment
  getAssignmentById: async (assignmentId: string): Promise<any | null> => {
    const assignmentDoc = await getDoc(doc(db, "assignments", assignmentId));
    if (!assignmentDoc.exists()) return null;
    return { id: assignmentDoc.id, ...assignmentDoc.data() };
  },

  // Create assignment
  createAssignment: async (assignmentData: any): Promise<string> => {
    const assignmentsCol = collection(db, "assignments");
    const docRef = await addDoc(assignmentsCol, {
      ...assignmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update assignment
  updateAssignment: async (assignmentId: string, data: any): Promise<void> => {
    await updateDoc(doc(db, "assignments", assignmentId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  // Delete assignment
  deleteAssignment: async (assignmentId: string): Promise<void> => {
    await deleteDoc(doc(db, "assignments", assignmentId));
  },

  // Submit assignment
  submitAssignment: async (assignmentId: string, studentId: string, submissionData: any): Promise<string> => {
    const submissionsCol = collection(db, "assignments", assignmentId, "submissions");
    const docRef = await addDoc(submissionsCol, {
      assignmentId,
      studentId,
      ...submissionData,
      submitedAt: serverTimestamp(),
      status: "submitted"
    });
    return docRef.id;
  },

  // Get student submissions for an assignment
  getSubmissions: async (assignmentId: string): Promise<any[]> => {
    const submissionsCol = collection(db, "assignments", assignmentId, "submissions");
    const snapshot = await getDocs(query(submissionsCol, orderBy("submitedAt", "desc")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get submission by student
  getSubmissionByStudent: async (assignmentId: string, studentId: string): Promise<any | null> => {
    const submissionsCol = collection(db, "assignments", assignmentId, "submissions");
    const q = query(submissionsCol, where("studentId", "==", studentId), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  // Grade submission
  gradeSubmission: async (assignmentId: string, submissionId: string, grade: number, feedback: string, status: 'graded' | 'revision_needed' = 'graded'): Promise<void> => {
    await updateDoc(doc(db, "assignments", assignmentId, "submissions", submissionId), {
      grade,
      feedback,
      status,
      gradedAt: serverTimestamp()
    });
  },
  // Get all A1 (Excellent) submissions for a student across ALL assignments
  getA1SubmissionsByStudent: async (studentId: string): Promise<any[]> => {
    const assignmentsCol = collection(db, "assignments");
    const snapshot = await getDocs(assignmentsCol);
    const results: any[] = [];
    
    for (const d of snapshot.docs) {
      const subCol = collection(db, "assignments", d.id, "submissions");
      // Only query by studentId to avoid composite index requirements
      const q = query(subCol, where("studentId", "==", studentId));
      const s = await getDocs(q);
      s.docs.forEach(sd => {
        const data = sd.data();
        // Filter by grade in JS
        if (data.grade >= 75) {
          results.push({ id: sd.id, assignmentDocId: d.id, assignmentTitle: d.data().title, ...data });
        }
      });
    }
    return results;
  }
};

// SPECIALIZATION SERVICE
export const specializationService = {
  // Get all specializations
  getAllSpecializations: async (): Promise<any[]> => {
    const specsCol = collection(db, "specializations");
    const snapshot = await getDocs(query(specsCol, orderBy("createdAt", "desc")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get specializations by program type
  getSpecializationsByProgram: async (programType: string): Promise<any[]> => {
    const specsCol = collection(db, "specializations");
    // Only use where() — no orderBy() — to avoid composite index requirement
    const q = query(specsCol, where("programType", "==", programType));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort by createdAt in JS
    return docs.sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis?.() ?? 0;
      const timeB = b.createdAt?.toMillis?.() ?? 0;
      return timeA - timeB;
    });
  },

  // Create specialization
  createSpecialization: async (data: any): Promise<string> => {
    const specsCol = collection(db, "specializations");
    const docRef = await addDoc(specsCol, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Update specialization
  updateSpecialization: async (id: string, data: any): Promise<void> => {
    await updateDoc(doc(db, "specializations", id), data);
  },

  // Delete specialization
  deleteSpecialization: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "specializations", id));
  }
};

