// Course Models and Enrollment Types

export type CourseBusinessStage = 'Idea' | 'Prototype' | 'Running Business' | 'All Stages';

export interface CourseModule {
  id: string;
  title: string;
  durationMinutes: number;
  summary: string;
  content: string;
  keyTakeaways: string[];
  materialsUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  businessStage: CourseBusinessStage;
  durationHours: number;
  instructor: string;
  modules: CourseModule[];
  learningOutcomes: string[];
  prerequisites?: string[];
  createdAt: string;
  updatedAt: string;
}

export type EnrollmentStatus = 'Not Enrolled' | 'Enrolled' | 'In Progress' | 'Completed';

export interface UserEnrollment {
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  progressPercent: number;
  completedModuleIds: string[];
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt?: string;
}
