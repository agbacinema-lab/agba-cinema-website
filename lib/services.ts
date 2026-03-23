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
  deleteDoc,
  writeBatch,
  onSnapshot
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
  Announcement,
  ShopProduct,
  Order,
  PromoCode,
  ChatMessage,
  ChatRoom
} from "./types";

// NOTIFICATION UTILITY (Defined first to avoid TDZ errors)
export const notifySuperAdmins = async (title: string, message: string, type: string, metadata?: any): Promise<void> => {
  const usersCol = collection(db, "users");
  const q = query(usersCol, where("role", "==", "super_admin"));
  const snap = await getDocs(q);

  const batch = (await import('firebase/firestore')).writeBatch(db);
  const notificationsCol = collection(db, "notifications");

  snap.docs.forEach(adminDoc => {
    const newRef = doc(notificationsCol);
    batch.set(newRef, {
      recipientId: adminDoc.id,
      title,
      message,
      type,
      metadata,
      read: false,
      createdAt: serverTimestamp()
    });
  });

  await batch.commit();
}

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
    const isPartnerRole = newRole === 'brand' || newRole === 'ngo';

    // Always update the users document
    await updateDoc(doc(db, "users", userId), { 
      role: newRole,
      isNGO: newRole === 'ngo',
      updatedAt: serverTimestamp()
    });

    // If the new role is a partner type (brand/ngo), also sync the brands document
    // so the brand dashboard reads the correct role on next login
    if (isPartnerRole) {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, "brands", userId), {
        role: newRole,
        isNGO: newRole === 'ngo',
        isSetupDone: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  },

  upgradeBrandAccess: async (userId: string): Promise<void> => {
    await updateDoc(doc(db, "users", userId), { hasPaidAccess: true });
    await updateDoc(doc(db, "brands", userId), { hasPaidAccess: true });
  },

  createApprovalRequest: async (request: Omit<ApprovalRequest, 'id' | 'status' | 'createdAt'>): Promise<void> => {
    const approvalsCol = collection(db, "approvals");
    const docRef = await addDoc(approvalsCol, {
      ...request,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    const usersCol = collection(db, "users");
    const q = query(usersCol, where("role", "==", "super_admin"));
    const adminSnap = await getDocs(q);

    for (const d of adminSnap.docs) {
      await notifySuperAdmins(
        "New Approval Request",
        `${request.requestBy.name} has submitted a request: ${request.type === 'internship_ready' ? 'Internship Readiness' : 'Role Change'}.`,
        'approval_request',
        {
          requestId: docRef.id,
          type: request.type,
          studentUID: request.data.userId
        }
      )
    }
  },

  getPendingApprovals: async (): Promise<ApprovalRequest[]> => {
    const approvalsCol = collection(db, "approvals");
    const q = query(approvalsCol, where("status", "==", "pending"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApprovalRequest));
  },

  processApproval: async (id: string, approved: boolean, processedBy: any, reason?: string): Promise<void> => {
    const approvalRef = doc(db, "approvals", id);
    const snap = await getDoc(approvalRef);
    if (!snap.exists()) return;

    const request = snap.data() as ApprovalRequest;

    if (approved) {
      if (request.type === 'role_change') {
        await updateDoc(doc(db, "users", request.data.userId), { 
          role: request.data.targetRole,
          isNGO: request.data.targetRole === 'ngo'
        });
      } else if (request.type === 'internship_ready') {
        await adminService.setInternshipStatus(request.data.userId, 'internship_ready', request.data.userName);
      } else if (request.type === 'revoke_internship') {
        await adminService.setInternshipStatus(request.data.userId, 'active', request.data.userName);
      }
      await updateDoc(approvalRef, { status: 'approved', processedBy, processedAt: serverTimestamp() });

      // Notify requester
      const verb = request.type === 'revoke_internship' ? 'Revoke' : 'Readiness';
      await notificationService.sendNotification({
        recipientId: request.requestBy.uid,
        title: "Request Approved",
        message: `Your ${verb} request for ${request.data.userName} has been approved.`,
        type: 'approval_result'
      } as any)
    } else {
      await updateDoc(approvalRef, { status: 'rejected', reason, processedBy, processedAt: serverTimestamp() });

      // Notify requester with reason
      const verb = request.type === 'revoke_internship' ? 'Revoke' : 'Readiness';
      await notificationService.sendNotification({
        recipientId: request.requestBy.uid,
        title: "Request Rejected",
        message: `Your ${verb} request for ${request.data.userName} was rejected: ${reason || 'No reason provided.'}`,
        type: 'approval_result'
      } as any)
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
  },

  setInternshipStatus: async (userId: string, status: 'active' | 'internship_ready', userName?: string): Promise<void> => {
    await updateDoc(doc(db, "users", userId), { status: status });

    // Also update student collection if exists
    const studentRef = collection(db, "students");
    const q = query(studentRef, where("studentUID", "==", userId));
    const sSnap = await getDocs(q);
    if (!sSnap.empty) {
      await updateDoc(sSnap.docs[0].ref, { status: status });
    }

    // Send In-App Notification to Student
    const title = status === 'internship_ready' ? "Mission Clearance: Approved" : "Mission Alert: Status Update";
    const message = status === 'internship_ready'
      ? `Congratulations ${userName || 'Agent'}, you have been approved for internship! Speak to your tutor immediately for deployment protocol.`
      : "Your internship status has been updated/revoked. Speak to your tutor immediately for further instructions.";

    await notificationService.sendNotification({
      recipientId: userId,
      title: title,
      message: message,
      type: 'internship_update'
    } as any);

    // ── Send Email to Student ────────────────────────────────────────────────
    try {
      // Fetch student's email from users collection
      const userSnap = await getDoc(doc(db, "users", userId));
      const userEmail = userSnap.exists() ? (userSnap.data() as any).email : null;
      const studentName = userName || (userSnap.exists() ? (userSnap.data() as any).name : null) || "Agent";

      if (userEmail) {
        const isApproved = status === 'internship_ready';
        const emailSubject = isApproved
          ? `🎉 Congratulations ${studentName} — Internship Approved!`
          : `Internship Status Update — ÀGBÀ CINEMA`;

        const emailHtml = isApproved
          ? `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
              <div style="background-color: #000; color: #fbbf24; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">ÀGBÀ CINEMA</h1>
              </div>
              <div style="padding: 36px;">
                <h2 style="color: #000; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; text-transform: uppercase;">
                  🎉 You've Been Approved for Internship!
                </h2>
                <p>Hello <strong>${studentName}</strong>,</p>
                <p>We are thrilled to inform you that you have officially been <strong style="color: #16a34a;">approved for internship placement</strong> at ÀGBÀ CINEMA!</p>
                <p>This is a major milestone in your journey — your dedication and hard work have paid off.</p>
                <div style="background: #fffbeb; border-left: 4px solid #fbbf24; padding: 16px; border-radius: 6px; margin: 24px 0;">
                  <p style="margin:0; font-weight: bold; color: #92400e; font-size: 14px;">📌 Next Step: Contact Your Tutor</p>
                  <p style="margin: 8px 0 0; color: #78350f; font-size: 13px;">Speak to your assigned tutor immediately for your deployment protocol and internship briefing.</p>
                </div>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://agba-cinema-website.vercel.app"}/student/dashboard"
                    style="background-color: #fbbf24; color: #000; padding: 14px 36px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                    Go to Dashboard →
                  </a>
                </div>
                <p style="color: #888; font-size: 13px;">Questions? Reach us at <a href="mailto:agbacinema@gmail.com" style="color: #b45309;">agbacinema@gmail.com</a></p>
              </div>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888;">
                <p style="margin: 0;">© ${new Date().getFullYear()} ÀGBÀ CINEMA HQ. ALL RIGHTS RESERVED.</p>
              </div>
            </div>
          `
          : `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
              <div style="background-color: #000; color: #fbbf24; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">ÀGBÀ CINEMA</h1>
              </div>
              <div style="padding: 36px;">
                <h2 style="color: #000; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; text-transform: uppercase;">Internship Status Update</h2>
                <p>Hello <strong>${studentName}</strong>,</p>
                <p>Your internship status has been updated by the ÀGBÀ CINEMA admin team. Please speak to your tutor immediately for further instructions.</p>
              </div>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888;">
                <p style="margin: 0;">© ${new Date().getFullYear()} ÀGBÀ CINEMA HQ. ALL RIGHTS RESERVED.</p>
              </div>
            </div>
          `;

        await fetch("/api/notifications/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to_email: userEmail,
            to_name: studentName,
            subject: emailSubject,
            message: isApproved
              ? `Congratulations ${studentName}! You have been approved for internship at ÀGBÀ CINEMA. Contact your tutor immediately for deployment protocol.`
              : `Hello ${studentName}, your internship status has been updated. Please speak to your tutor for further instructions.`,
            html: emailHtml,
          })
        }).catch((err: any) => console.error("Internship Email Error:", err));
      }
    } catch (emailErr: any) {
      console.error("Failed to send internship status email:", emailErr);
    }
    // ── End Email ─────────────────────────────────────────────────────────────
  },

  revokeInternshipReadiness: async (userId: string): Promise<void> => {
    await adminService.setInternshipStatus(userId, 'active');
  },
  getSettings: async () => {
    const snap = await getDoc(doc(db, "system", "settings"));
    if (!snap.exists()) {
      return {
        notifications: {
          email: true,
          browser: true,
          studentJoining: true,
          payments: true
        },
        theme: 'dark'
      };
    }
    return snap.data();
  },

  updateSettings: async (settings: any) => {
    await setDoc(doc(db, "system", "settings"), settings, { merge: true });
  },

  getAcademySettings: async () => {
    const snap = await getDoc(doc(db, "system", "academy"));
    if (!snap.exists()) {
      return {
        activeCohort: "Cohort 3",
        cohortStartDate: "August"
      };
    }
    return snap.data();
  },

  updateAcademySettings: async (settings: { activeCohort: string, cohortStartDate: string }) => {
    await setDoc(doc(db, "system", "academy"), settings, { merge: true });
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
    let q = query(studentsCol);
    if (isPremiumOnly) {
      q = query(studentsCol, where("programType", "==", "mentorship"));
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
      where("status", "in", ["assigned", "approved"])
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ requestId: doc.id, ...doc.data() } as InternshipRequest));
  },

  getBrandRequests: async (brandId: string): Promise<InternshipRequest[]> => {
    const col = collection(db, "internship_requests");
    const q = brandId === "all"
      ? query(col, orderBy("requestedAt", "desc"))
      : query(col, where("brandId", "==", brandId), orderBy("requestedAt", "desc"));

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
  },

  addStrike: async (studentId: string, reason: string): Promise<number> => {
    const studentRef = doc(db, "users", studentId);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) throw new Error("Student not found");

    const data = snap.data();
    const currentStrikes = (data.strikes || 0) + 1;

    // Atomic update for strikes
    await updateDoc(studentRef, { 
      strikes: currentStrikes,
      updatedAt: serverTimestamp() 
    });

    // Mirror to students collection for specialized logic
    const studentsCol = collection(db, "students");
    const q = query(studentsCol, where("userId", "==", studentId));
    const sSnap = await getDocs(q);
    if (!sSnap.empty) {
      await updateDoc(sSnap.docs[0].ref, { strikes: currentStrikes });
    }

    if (currentStrikes >= 3) {
      // Terminal Disciplinary Action: Account Erasure/Deactivation
      await updateDoc(studentRef, {
        status: 'deactivated',
        role: 'retired_intern', // Prevent login as student
        deactivationReason: "Automatic System Clearance: 3 Critical Queries (Strikes) received from Partner Authority."
      });
      
      // Notify Admin of Terminal Action
      await notifySuperAdmins(
        "TERMINAL DISCIPLINARY ACTION",
        `Student ${data.name || studentId} has reached the strike limit (3/3) and has been deactivated from the system.`,
        "student_dismissed",
        { studentId, finalReason: reason }
      );
    } else if (currentStrikes === 2) {
      // Alert: Replacement Eligibility
      await notifySuperAdmins(
        "REPLACEMENT ELIGIBILITY",
        `Brand has deployed a 2nd Strike for ${data.name || studentId}. They are now eligible for a secondary hire protocol.`,
        "replacement_alert",
        { studentId, brandId: data.currentBrandId }
      );
    }

    return currentStrikes;
  },

  getSettings: async () => {
    const snap = await getDoc(doc(db, "system_settings", "brand"));
    if (snap.exists()) return snap.data();
    return {
      accreditationFee: 100000,
      defaultDuration: "3 Months",
      rosterSubtitle: "Deployment-ready specialists in sectors",
      briefDescription: "Our HODs use this brief to match specialists to your needs.",
      internsSubtitle: "Specialists currently deployed to your sectors",
      accreditationPlaceholder: "Board Locked: Accreditation Required"
    };
  },

  setPartnerType: async (userId: string, type: 'brand' | 'ngo'): Promise<void> => {
    await updateDoc(doc(db, "users", userId), {
      role: type,
      isNGO: type === 'ngo',
      updatedAt: serverTimestamp()
    });
    // Also mark as setup in brands table
    await updateDoc(doc(db, "brands", userId), {
      isSetupDone: true,
      isNGO: type === 'ngo'
    });
  }
};

// PROMO CODE SERVICE
export const promoCodeService = {
  getPromoCode: async (code: string): Promise<PromoCode | null> => {
    const col = collection(db, "promo_codes");
    const q = query(col, where("code", "==", code.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as PromoCode;
  },

  applyCode: async (codeId: string): Promise<void> => {
    const batch = (await import('firebase/firestore')).writeBatch(db);
    const codeRef = doc(db, "promo_codes", codeId);
    const codeSnap = await getDoc(codeRef);
    if (!codeSnap.exists()) return;

    const currentUsed = (codeSnap.data().usedCount || 0) + 1;
    batch.update(codeRef, { usedCount: currentUsed });
    await batch.commit();
  },

  getAllCodes: async (): Promise<PromoCode[]> => {
    const col = collection(db, "promo_codes");
    const snap = await getDocs(query(col, orderBy("createdAt", "desc")));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromoCode));
  },

  createCode: async (data: Omit<PromoCode, 'id'>): Promise<string> => {
    const col = collection(db, "promo_codes");
    const docRef = await addDoc(col, {
      ...data,
      code: data.code.toUpperCase(),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  getCodesByNgo: async (ngoId: string): Promise<PromoCode[]> => {
    const col = collection(db, "promo_codes");
    const q = query(col, where("ngoId", "==", ngoId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromoCode));
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

  createAssignment: async (assignmentData: any): Promise<string> => {
    const assignmentsCol = collection(db, "assignments");
    const docRef = await addDoc(assignmentsCol, {
      ...assignmentData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  getAssignments: async (subject?: string): Promise<any[]> => {
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

  // Get curriculum modules for a specific curriculum with materials included
  getModulesByCurriculum: async (curriculumId: string): Promise<any[]> => {
    const modulesCol = collection(db, "curricula", curriculumId, "modules");
    const q = query(modulesCol, orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    const modules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch materials for each module
    const modulesWithMaterials = await Promise.all(modules.map(async (m) => {
      const matsCol = collection(db, "curricula", curriculumId, "modules", m.id, "materials");
      const matsSnap = await getDocs(query(matsCol, orderBy("uploadedAt", "desc")));
      return {
        ...m,
        learningMaterials: matsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
    }));

    return modulesWithMaterials;
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

  // Get curriculum modules for a specific specialization with materials included
  getModulesBySpecialization: async (specialization: string): Promise<any[]> => {
    // 1. Find the curriculum ID for this specialization
    const curriculaCol = collection(db, "curricula");
    const specQuery = query(curriculaCol, where("specialization", "==", specialization), limit(1));
    const specSnap = await getDocs(specQuery);

    if (specSnap.empty) {
      // Fallback to legacy path if no curriculum found
      const modulesCol = collection(db, "curriculumModules");
      const q = query(modulesCol, where("specialization", "==", specialization), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    const curriculumId = specSnap.docs[0].id;
    const modulesCol = collection(db, "curricula", curriculumId, "modules");
    const q = query(modulesCol, orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    const modules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Attach materials
    const modulesWithMaterials = await Promise.all(modules.map(async (m) => {
      const matsCol = collection(db, "curricula", curriculumId, "modules", m.id, "materials");
      const matsSnap = await getDocs(query(matsCol, orderBy("uploadedAt", "desc")));
      return {
        ...m,
        learningMaterials: matsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
    }));

    return modulesWithMaterials;
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

  getAssignmentByModule: async (moduleId: string): Promise<any | null> => {
    const assignmentsCol = collection(db, "assignments");
    const q = query(assignmentsCol, where("moduleId", "==", moduleId), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
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

  // Dynamic Activation logic
  activateAssignment: async (studentId: string, assignmentId: string, durationDays?: number): Promise<void> => {
    const activationRef = doc(db, "assignmentActivations", `${studentId}_${assignmentId}`);
    const snap = await getDoc(activationRef).catch(() => null);
    if (snap?.exists()) return;

    let finalDuration = durationDays;
    if (!finalDuration) {
      const assDoc = await getDoc(doc(db, "assignments", assignmentId));
      if (assDoc.exists()) {
        finalDuration = assDoc.data().durationDays || 3;
      } else {
        finalDuration = 3;
      }
    }

    const activatedAt = new Date();
    const dueDate = new Date(activatedAt.getTime() + (finalDuration || 3) * 24 * 60 * 60 * 1000);

    const { setDoc } = await import('firebase/firestore');
    await setDoc(activationRef, {
      studentId,
      assignmentId,
      activatedAt,
      dueDate,
      createdAt: serverTimestamp()
    });
  },

  getActivation: async (studentId: string, assignmentId: string): Promise<any | null> => {
    const activationRef = doc(db, "assignmentActivations", `${studentId}_${assignmentId}`);
    const snap = await getDoc(activationRef).catch(() => null);
    return snap?.exists() ? snap.data() : null;
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

// NOTIFICATION SERVICE
export const notificationService = {
  getUserNotifications: async (userId: string): Promise<any[]> => {
    const col = collection(db, "notifications");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Fetch notifications specifically for this user + broadcast "all" notifications
    const userQ = query(col, where("recipientId", "==", userId), orderBy("createdAt", "desc"), limit(30));
    const allQ = query(col, where("recipientId", "==", "all"), orderBy("createdAt", "desc"), limit(10));

    const [userSnap, allSnap] = await Promise.all([getDocs(userQ), getDocs(allQ)]);

    const userDocs = userSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
    const allDocs = allSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

    // Merge and deduplicate by id
    const merged = [...userDocs, ...allDocs].filter(
      (n, idx, self) => self.findIndex(x => x.id === n.id) === idx
    );

    // Asynchronously clean up old read notifications (fire and forget)
    merged.forEach(async (n: any) => {
      if (n.read) {
        const createdAt = n.createdAt?.toMillis?.() ?? (n.createdAt?.seconds ? n.createdAt.seconds * 1000 : 0);
        if (now - createdAt > oneDay) {
          try { await deleteDoc(doc(db, "notifications", n.id)); } catch (e) { }
        }
      }
    });

    return merged
      .filter((n: any) => {
        if (n.read) {
          const createdAt = n.createdAt?.toMillis?.() ?? (n.createdAt?.seconds ? n.createdAt.seconds * 1000 : 0);
          if (now - createdAt > oneDay) return false;
        }
        return true;
      })
      .sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis?.() ?? (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis?.() ?? (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      })
      .slice(0, 30);
  },


  markAsRead: async (notificationId: string): Promise<void> => {
    await updateDoc(doc(db, "notifications", notificationId), { read: true });
  },

  clearAllNotifications: async (userId: string): Promise<void> => {
    const col = collection(db, "notifications");
    const snap = await getDocs(col);
    const batch = writeBatch(db);
    let count = 0;

    snap.docs.forEach(d => {
      const data = d.data();
      if ((data.recipientId === userId || data.recipientId === "all")) {
        // If it's already read, we delete it to "keep it not long"
        // If it's unread, we also delete it because user requested to "clear all"
        batch.delete(d.ref);
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
  },

  sendNotification: async (data: { recipientId: string, title: string, message: string, type: string, metadata?: any }): Promise<string> => {
    const col = collection(db, "notifications");
    const docRef = await addDoc(col, {
      ...data,
      read: false,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }
};

// SHOP SERVICE
export const shopService = {
  getProducts: async (): Promise<ShopProduct[]> => {
    const col = collection(db, "shop_products");
    const snap = await getDocs(query(col, orderBy("createdAt", "desc")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ShopProduct));
  },

  addProduct: async (product: Omit<ShopProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const col = collection(db, "shop_products");
    const docRef = await addDoc(col, {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  updateProduct: async (id: string, data: Partial<ShopProduct>): Promise<void> => {
    await updateDoc(doc(db, "shop_products", id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  deleteProduct: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "shop_products", id));
  },


  placeOrder: async (order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<string> => {
    const col = collection(db, "orders");
    const docRef = await addDoc(col, {
      ...order,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    // Notify Admins
    await notifySuperAdmins(
      "New Item Acquired",
      `${order.userName} has placed an order for assets totalling ${order.total}. Check Order Portal.`,
      "new_order",
      { orderId: docRef.id }
    );

    return docRef.id;
  },

  getOrders: async (): Promise<Order[]> => {
    const col = collection(db, "orders");
    const snap = await getDocs(query(col, orderBy("createdAt", "desc")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<void> => {
    await updateDoc(doc(db, "orders", id), { status });
  },

  getSettings: async () => {
    const snap = await getDoc(doc(db, "system_settings", "shop"));
    if (snap.exists()) return snap.data();
    return {
      deliveryRates: { "Lagos": 2500, "Abuja": 5000, "Port Harcourt": 5000, "Rivers": 5000, "Enugu": 4500, "Anambra": 4500, "default": 6500 }
    };
  },

  updateSettings: async (settings: any) => {
    await setDoc(doc(db, "system_settings", "shop"), settings, { merge: true });
  },

  calculateDeliveryFee: (state: string, settings?: any): number => {
    if (!state) return 0;
    const rates = settings?.deliveryRates || { "Lagos": 2500, "Abuja": 5000, "Port Harcourt": 5000, "Rivers": 5000, "Enugu": 4500, "Anambra": 4500, "default": 6500 };
    return rates[state] || rates["default"] || 6500;
  },

  cancelOrder: async (id: string): Promise<void> => {
    await updateDoc(doc(db, "orders", id), { status: 'cancelled' });
  }
};

// ==========================================
// NEW: LIVE CLASS TIMETABLE SERVICE
// ==========================================
export interface LiveClassSession {
  id?: string;
  topic: string;
  tutorId: string;
  tutorName: string;
  targetAudience: 'individual' | 'cohort';
  targetId: string; // Either studentId or cohort name (e.g. "Cohort 3")
  targetName: string; // Student name or Cohort 3
  programType: 'gopro' | 'mentorship';
  startTime: any; // Firestore Timestamp
  durationMinutes: number;
  meetLink: string;
  recordingLink?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  createdAt: any;
}

export const classSchedulerService = {
  // 1. Schedule a new class
  scheduleClass: async (data: Omit<LiveClassSession, 'id' | 'createdAt'>) => {
    const classesCol = collection(db, "live_classes");
    const docRef = await addDoc(classesCol, {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // 2. Add video recording after completion
  addRecordingLink: async (classId: string, youtubeLink: string) => {
    await updateDoc(doc(db, "live_classes", classId), {
      recordingLink: youtubeLink,
      status: 'completed'
    });
  },

  // 3. For Tutors to see their generated schedule
  getClassesByTutor: async (tutorId: string) => {
    const q = query(
      collection(db, "live_classes"),
      where("tutorId", "==", tutorId),
      orderBy("startTime", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<LiveClassSession, 'id'>) } as LiveClassSession));
  },

  // 4. For Students to see their personalized live timetable (1-on-1 Mentorship + Go Pro Cohort)
  getStudentTimetable: async (uid: string, cohortId?: string) => {
    const classesCol = collection(db, "live_classes");

    // They get classes strictly scheduled for them AND classes scheduled for their specific cohort
    const queries = [];
    queries.push(getDocs(query(classesCol, where("targetId", "==", uid))));
    if (cohortId) {
      queries.push(getDocs(query(classesCol, where("targetId", "==", cohortId))));
    }

    const results = await Promise.all(queries);
    const uniqueClasses = new Map();

    results.forEach(snap => {
      snap.docs.forEach(doc => {
        uniqueClasses.set(doc.id, { id: doc.id, ...(doc.data() as Omit<LiveClassSession, 'id'>) });
      });
    });

    // Sort combined explicitly by startTime
    return Array.from(uniqueClasses.values()).sort((a: any, b: any) =>
      (a.startTime?.toMillis() || 0) - (b.startTime?.toMillis() || 0)
    ) as LiveClassSession[];
  },

  // 5. Update an existing class
  updateClass: async (classId: string, data: Partial<LiveClassSession>) => {
    await updateDoc(doc(db, "live_classes", classId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  // 6. Delete a class
  deleteClass: async (classId: string) => {
    await deleteDoc(doc(db, "live_classes", classId));
  }
};

// CHAT SERVICE
export const chatService = {
  getOrCreateChatRoom: async (metadata: any): Promise<string> => {
    const roomsCol = collection(db, "chat_rooms");
    const q = query(roomsCol, where("metadata.requestId", "==", metadata.requestId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs[0].id;
    }

    // Identify participants (Student, Brand, Tutor and Admin)
    const participants = [metadata.brandId, metadata.studentId];
    const participantDetails: any = {
      [metadata.brandId]: { name: metadata.brandName, role: 'brand' },
      [metadata.studentId]: { name: metadata.studentName, role: 'student' }
    };

    // Fetch tutor if assigned to student
    try {
      const studentSnap = await getDoc(doc(db, "users", metadata.studentId));
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        if (studentData.tutorId) {
          participants.push(studentData.tutorId);
          participantDetails[studentData.tutorId] = { 
            name: studentData.tutorName || "Assigned Tutor", 
            role: 'tutor' 
          };
        }
      }
    } catch (e) {
      console.warn("Failed to fetch tutor details for chat room initialization:", e);
    }

    // We'll also fetch all super_admins to add them to the room
    const adminSnap = await getDocs(query(collection(db, "users"), where("role", "==", "super_admin")));
    adminSnap.docs.forEach(d => {
      if (!participants.includes(d.id)) participants.push(d.id);
      participantDetails[d.id] = { name: d.data().name || "System Admin", role: 'super_admin' };
    });

    const docRef = await addDoc(roomsCol, {
      participants,
      participantDetails,
      createdAt: serverTimestamp(),
      metadata,
      lastMessage: "Channel opened. Official communication initiated.",
      lastMessageAt: serverTimestamp()
    });

    return docRef.id;
  },

  sendMessage: async (roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> => {
    const messagesCol = collection(db, "chat_rooms", roomId, "messages");
    const roomRef = doc(db, "chat_rooms", roomId);

    await addDoc(messagesCol, {
      ...message,
      timestamp: serverTimestamp()
    });

    await updateDoc(roomRef, {
      lastMessage: message.text,
      lastMessageAt: serverTimestamp()
    });

    // Notify other participants via Push Notification (Async)
    try {
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        const otherParticipants = (roomData.participants || []).filter((p: string) => p !== message.senderId);
        
        if (otherParticipants.length > 0) {
          fetch("/api/notifications/push", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
               userIds: otherParticipants,
               title: `New message from ${message.senderName}`,
               body: message.text.length > 50 ? message.text.substring(0, 50) + "..." : message.text,
               metadata: {
                 link: `/admin?tab=communications&roomId=${roomId}`,
                 roomId
               }
             })
          }).catch(e => console.error("Push API delivery error:", e));
        }
      }
    } catch (e) {
      console.warn("Failed to initiate push notifications for message:", e);
    }
  },

  subscribeToRooms: (callback: (rooms: ChatRoom[]) => void) => {
    const roomsCol = collection(db, "chat_rooms");
    const q = query(roomsCol, orderBy("lastMessageAt", "desc"));

    return onSnapshot(q, (snap) => {
      const rooms = snap.docs.map(doc => ({
        roomId: doc.id,
        ...doc.data()
      })) as ChatRoom[];
      callback(rooms);
    });
  },

  subscribeToMessages: (roomId: string, callback: (messages: ChatMessage[]) => void) => {
    const messagesCol = collection(db, "chat_rooms", roomId, "messages");
    const q = query(messagesCol, orderBy("timestamp", "asc"), limit(100));

    return onSnapshot(q, (snap) => {
      const messages = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      callback(messages);
    });
  },

  getRoomDetails: async (roomId: string): Promise<ChatRoom | null> => {
    const docRef = doc(db, "chat_rooms", roomId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { roomId: snap.id, ...snap.data() } as ChatRoom;
  }
};
