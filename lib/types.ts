export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  image: string;
  tags: string[];
  category: string;
  readTime: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  client: string;
  description: string;
  image: string;
  youtubeEmbedUrl: string;
  tags: string[];
  year: number;
  duration: string;
}

export type UserRole = 'super_admin' | 'director' | 'head_of_department' | 'admin' | 'tutor' | 'staff' | 'student' | 'brand';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  hasPaidAccess?: boolean; // For Brands
  createdAt: any;
}

export interface AdminPermissions {
  reviewPortfolio: boolean;
  approveStudents: boolean;
  assignProjects: boolean;
  manageBrands: boolean;
}

export interface AdminProfile {
  userId: string;
  type: 'tutor' | 'staff' | 'both';
  permissions: AdminPermissions;
}

export interface StudentProfile {
  studentId: string;
  userId: string;
  studentUID: string;
  fullName: string;
  bio: string;
  skills: string[];
  programType: 'gopro' | 'mentorship';
  portfolioLinks: {
    youtube?: string;
    drive?: string;
    behance?: string;
    website?: string;
  };
  status: 'active' | 'graduated' | 'internship_ready';
  createdAt: any;
}

export interface PortfolioReview {
  reviewId: string;
  studentId: string;
  reviewerId: string;
  feedback: string;
  rating: number;
  status: 'pending' | 'approved' | 'needs_revision';
  createdAt: any;
}

export interface BrandProfile {
  brandId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  website: string;
  industry: string;
  verified: boolean;
}

export interface InternshipRequest {
  requestId: string;
  brandId: string;
  studentId: string;
  requestedAt: any;
  status: 'pending' | 'approved' | 'declined' | 'assigned';
}

export type Subject = 'Video Editing' | 'Motion Design' | 'Script Writing' | 'Storytelling' | 'Business of Creativity';

export interface ClassSession {
  id: string;
  title: string;
  subject: Subject;
  tutorId: string;
  youtubeLink: string;
  date: any; // Firestore Timestamp
  description: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  tutorId: string;
  stageNumber: number;
  isOpen: boolean;
  createdAt: any;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentUID: string;
  driveLink: string;
  status: 'pending' | 'approved' | 'redo';
  grade?: number; // Optional numeric grade if needed
  tutorComment?: string;
  submittedAt: any;
  gradedAt?: any;
}

export interface ApprovalRequest {
  id: string;
  type: 'role_change' | 'internship_ready';
  requestBy: { uid: string; name: string; email: string };
  data: any; // { userId: string, targetRole: string } or { studentId: string }
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface InternshipTerms {
  fee: number;
  currency: string;
  description: string;
}
