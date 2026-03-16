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
    const q = query(curriculaCol, where("programType", "==", programType), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  getModuleById: async (moduleId: string): Promise<any | null> => {
    const moduleDoc = await getDoc(doc(db, "curriculumModules", moduleId));
    if (!moduleDoc.exists()) return null;
    return { id: moduleDoc.id, ...moduleDoc.data() };
  },

  // Add learning material to a module
  addLearningMaterial: async (moduleId: string, material: any): Promise<string> => {
    const materialsCol = collection(db, "curriculumModules", moduleId, "materials");
    const docRef = await addDoc(materialsCol, {
      ...material,
      uploadedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Get all materials for a module
  getMaterialsByModule: async (moduleId: string): Promise<any[]> => {
    const materialsCol = collection(db, "curriculumModules", moduleId, "materials");
    const snapshot = await getDocs(query(materialsCol, orderBy("uploadedAt", "desc")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Delete learning material
  deleteMaterial: async (moduleId: string, materialId: string): Promise<void> => {
    await deleteDoc(doc(db, "curriculumModules", moduleId, "materials", materialId));
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
  gradeSubmission: async (assignmentId: string, submissionId: string, grade: number, feedback: string): Promise<void> => {
    await updateDoc(doc(db, "assignments", assignmentId, "submissions", submissionId), {
      grade,
      feedback,
      status: "graded",
      gradedAt: serverTimestamp()
    });
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
    const q = query(specsCol, where("programType", "==", programType), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

