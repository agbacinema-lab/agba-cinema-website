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
  programType?: any;
  specialization?: any;
  phone?: string;
  bio?: string;
  avatarId?: string;
  tutorId?: string;
  tutorName?: string;
  updatedAt?: any;
  enrolledSpecializations?: Array<{
    id: string;
    title: string;
    value: string;
    programType: string;
  }>;
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
  hasPaidAccess: boolean;
  requirements?: string;
  preferredSkills?: string[];
  internshipDuration?: string;
}

export interface InternshipRequest {
  requestId: string;
  brandId: string;
  studentId: string;
  studentName?: string;
  brandName?: string;
  requestedAt: any;
  status: 'pending' | 'approved' | 'declined' | 'assigned';
  requirements?: string;
  duration?: string;
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: any;
  };
}

export interface BrandMeeting {
  meetingId: string;
  brandId: string;
  brandName: string;
  topic: string;
  scheduledAt: any;
  status: 'pending' | 'confirmed' | 'cancelled';
  link?: string;
}

export interface PerformanceFeedback {
  feedbackId: string;
  requestId: string;
  brandId: string;
  studentId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: any;
}

export type Subject = 'Video Editing' | 'Motion Design' | 'Script Writing' | 'Storytelling' | 'Business of Creativity';

// Curriculum and Learning Materials
export type CourseType = 'gopro' | 'mentorship';
export type CourseSpecialization = 'video-editing-laptop' | 'video-editing-mobile' | 'after-effects' | 'motion-design' | 'script-writing';

export interface Specialization {
  id: string;
  programType: CourseType;
  label: string;
  value: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: any;
}

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  programType: CourseType;
  specialization: CourseSpecialization;
  icon?: string;
  color?: string;
  moduleCount?: number;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}
export interface LearningMaterial {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'document' | 'link';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  videoUrl?: string;
  externalLink?: string;
  uploadedBy: string;
  uploadedAt: any;
  readOnly: boolean;
}

export interface ModuleContent {
  id: string;
  number: string;
  title: string;
  description: string;
  topics: string[];
  materials: LearningMaterial[];
  hasAssignment: boolean;
  order: number;
}

export interface CurriculumModule {
  id: string;
  courseId: string;
  courseType: CourseType;
  specialization: CourseSpecialization;
  moduleNumber: number;
  title: string;
  description: string;
  topics: string[];
  learningMaterials: LearningMaterial[];
  assignmentId?: string;
  isBonusModule: boolean;
  order: number;
  createdAt: any;
  updatedAt: any;
}

export interface CourseProgress {
  id: string;
  studentId: string;
  courseId: string;
  specialization: CourseSpecialization;
  completedModules: string[];
  currentModuleId?: string;
  enrolledAt: any;
  lastAccessedAt: any;
  status: 'enrolled' | 'completed' | 'paused';
}

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

// Assignment Management
export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  programType: CourseType;
  specialization: CourseSpecialization;
  curriculumId?: string;
  moduleId?: string;
  dueDate: any;
  maxGrade: number;
  rubric?: string;
  attachmentUrl?: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionUrl: string;
  notes?: string;
  submitedAt: any;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'revision_needed';
}
