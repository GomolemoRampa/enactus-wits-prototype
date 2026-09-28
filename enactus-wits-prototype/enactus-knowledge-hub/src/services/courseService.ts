import { Course, CourseBusinessStage, UserEnrollment, EnrollmentStatus } from '../types/course';
import { INITIAL_COURSES } from './mockData';

class CourseService {
  private coursesKey = 'enactus_kh_courses';
  private enrollmentsKey = 'enactus_kh_enrollments';

  constructor() {
    this.initStorage();
  }

  private initStorage(): void {
    if (!localStorage.getItem(this.coursesKey)) {
      localStorage.setItem(this.coursesKey, JSON.stringify(INITIAL_COURSES));
    }
    if (!localStorage.getItem(this.enrollmentsKey)) {
      localStorage.setItem(this.enrollmentsKey, JSON.stringify([]));
    }
  }

  public getCourses(): Course[] {
    try {
      const data = localStorage.getItem(this.coursesKey);
      return data ? JSON.parse(data) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  }

  public getCourseById(id: string): Course | undefined {
    const courses = this.getCourses();
    return courses.find(c => c.id === id);
  }

  public filterCourses(options: {
    stage?: CourseBusinessStage | 'All';
    category?: string;
    searchQuery?: string;
  }): Course[] {
    let list = this.getCourses();

    if (options.stage && options.stage !== 'All') {
      list = list.filter(
        c => c.businessStage === options.stage || c.businessStage === 'All Stages'
      );
    }

    if (options.category && options.category !== 'All') {
      list = list.filter(c => c.category === options.category);
    }

    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.toLowerCase().trim();
      list = list.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.learningOutcomes.some(lo => lo.toLowerCase().includes(q))
      );
    }

    return list;
  }

  // Enrollment Management
  public getUserEnrollments(userId: string): UserEnrollment[] {
    try {
      const data = localStorage.getItem(this.enrollmentsKey);
      const all: UserEnrollment[] = data ? JSON.parse(data) : [];
      return all.filter(e => e.userId === userId);
    } catch {
      return [];
    }
  }

  public getEnrollment(userId: string, courseId: string): UserEnrollment | undefined {
    const userEnrollments = this.getUserEnrollments(userId);
    return userEnrollments.find(e => e.courseId === courseId);
  }

  public enrollInCourse(userId: string, courseId: string): UserEnrollment {
    const all = this.getAllEnrollments();
    const existingIndex = all.findIndex(e => e.userId === userId && e.courseId === courseId);

    const now = new Date().toISOString();
    const course = this.getCourseById(courseId);
    const totalModules = course?.modules.length || 1;

    let updatedEnrollment: UserEnrollment;

    if (existingIndex >= 0) {
      updatedEnrollment = all[existingIndex];
    } else {
      updatedEnrollment = {
        userId,
        courseId,
        status: 'Enrolled',
        progressPercent: 0,
        completedModuleIds: [],
        enrolledAt: now,
        lastAccessedAt: now,
      };
      all.push(updatedEnrollment);
      localStorage.setItem(this.enrollmentsKey, JSON.stringify(all));
    }

    return updatedEnrollment;
  }

  public toggleModuleCompletion(userId: string, courseId: string, moduleId: string): UserEnrollment {
    const all = this.getAllEnrollments();
    let enrollment = all.find(e => e.userId === userId && e.courseId === courseId);
    const course = this.getCourseById(courseId);
    const totalModules = course?.modules.length || 1;

    const now = new Date().toISOString();

    if (!enrollment) {
      enrollment = {
        userId,
        courseId,
        status: 'In Progress',
        progressPercent: 0,
        completedModuleIds: [moduleId],
        enrolledAt: now,
        lastAccessedAt: now,
      };
      all.push(enrollment);
    } else {
      const isCompleted = enrollment.completedModuleIds.includes(moduleId);
      if (isCompleted) {
        enrollment.completedModuleIds = enrollment.completedModuleIds.filter(id => id !== moduleId);
      } else {
        enrollment.completedModuleIds.push(moduleId);
      }

      enrollment.lastAccessedAt = now;
      const completedCount = enrollment.completedModuleIds.length;
      enrollment.progressPercent = Math.round((completedCount / totalModules) * 100);

      if (completedCount === 0) {
        enrollment.status = 'Enrolled';
      } else if (completedCount >= totalModules) {
        enrollment.status = 'Completed';
        enrollment.completedAt = now;
      } else {
        enrollment.status = 'In Progress';
      }
    }

    localStorage.setItem(this.enrollmentsKey, JSON.stringify(all));
    return enrollment;
  }

  private getAllEnrollments(): UserEnrollment[] {
    try {
      const data = localStorage.getItem(this.enrollmentsKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Admin Operations
  public createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Course {
    const courses = this.getCourses();
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    courses.unshift(newCourse);
    localStorage.setItem(this.coursesKey, JSON.stringify(courses));
    return newCourse;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | null {
    const courses = this.getCourses();
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updated = {
      ...courses[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    courses[index] = updated;
    localStorage.setItem(this.coursesKey, JSON.stringify(courses));
    return updated;
  }

  public deleteCourse(id: string): boolean {
    const courses = this.getCourses();
    const filtered = courses.filter(c => c.id !== id);
    if (filtered.length === courses.length) return false;
    localStorage.setItem(this.coursesKey, JSON.stringify(filtered));
    return true;
  }
}

export const courseService = new CourseService();
