import React from 'react';
import { Course } from '../../types/course';
import { UserEnrollment } from '../../types/course';
import { StageBadge } from '../common/StageBadge';
import { Clock, BookOpen, CheckCircle, ArrowRight, User } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  enrollment?: UserEnrollment;
  onOpenDetails: (course: Course) => void;
  onEnroll?: (courseId: string) => void;
  isReadOnly?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  enrollment,
  onOpenDetails,
  onEnroll,
  isReadOnly = false,
}) => {
  let stageStripClass = 'stage-all';
  if (course.businessStage === 'Idea') stageStripClass = 'stage-idea';
  if (course.businessStage === 'Prototype') stageStripClass = 'stage-prototype';
  if (course.businessStage === 'Running Business') stageStripClass = 'stage-running';

  const isEnrolled = enrollment && enrollment.status !== 'Not Enrolled';
  const isCompleted = enrollment?.status === 'Completed';

  return (
    <div className="course-card">
      <div className={`course-card-stage-strip ${stageStripClass}`} />
      
      <div className="course-card-body">
        <div className="course-meta-top">
          <span className="flat-tag" style={{ fontSize: 10 }}>
            {course.category}
          </span>
          <StageBadge stage={course.businessStage} />
        </div>

        <h3 className="course-title">{course.title}</h3>
        <p className="course-desc">{course.description}</p>

        <div className="course-stats-row">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> {course.durationHours} hrs
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={12} /> {course.modules.length} Modules
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <User size={12} /> {course.instructor.split(' ')[0]}
          </span>
        </div>

        {/* Enrollment progress bar if enrolled */}
        {isEnrolled && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: isCompleted ? 'var(--status-running)' : 'var(--accent-gold-dark)' }}>
                {enrollment.status}
              </span>
              <span className="font-mono">{enrollment.progressPercent}%</span>
            </div>
            <div style={{ height: 4, backgroundColor: 'var(--bg-subtle)', width: '100%', border: '1px solid var(--border-color)' }}>
              <div
                style={{
                  height: '100%',
                  width: `${enrollment.progressPercent}%`,
                  backgroundColor: isCompleted ? 'var(--status-running)' : 'var(--accent-gold)',
                }}
              />
            </div>
          </div>
        )}

        <div className="course-footer">
          <button
            type="button"
            className="btn-sm"
            onClick={() => onOpenDetails(course)}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <BookOpen size={12} />
            View Course
          </button>

          {!isReadOnly && (
            <>
              {isEnrolled ? (
                <button
                  type="button"
                  className="btn-sm btn-accent"
                  onClick={() => onOpenDetails(course)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  {isCompleted ? <CheckCircle size={12} /> : <ArrowRight size={12} />}
                  {isCompleted ? 'Completed' : 'Continue'}
                </button>
              ) : (
                onEnroll && (
                  <button
                    type="button"
                    className="btn-sm btn-primary"
                    onClick={() => onEnroll(course.id)}
                  >
                    Enroll Now
                  </button>
                )
              )}
            </>
          )}

          {isReadOnly && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Advisor View
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
