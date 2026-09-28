import React from 'react';
import { Course, UserEnrollment } from '../../types/course';
import { StageBadge } from '../common/StageBadge';
import { X, Clock, User, CheckCircle2, Circle, BookOpen, CheckSquare } from 'lucide-react';

interface CourseDetailModalProps {
  course: Course;
  enrollment?: UserEnrollment;
  onClose: () => void;
  onEnroll: (courseId: string) => void;
  onToggleModule: (courseId: string, moduleId: string) => void;
  isReadOnly?: boolean;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  enrollment,
  onClose,
  onEnroll,
  onToggleModule,
  isReadOnly = false,
}) => {
  const isEnrolled = !!enrollment && enrollment.status !== 'Not Enrolled';
  const completedIds = enrollment?.completedModuleIds || [];

  return (
    <div className="flat-modal-backdrop" onClick={onClose}>
      <div className="flat-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="flat-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={16} className="text-gold" />
            <strong style={{ fontSize: 14 }}>Course Overview</strong>
          </div>
          <button type="button" className="btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="flat-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <StageBadge stage={course.businessStage} size="md" />
              <span className="flat-tag">{course.category}</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              {course.title}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              {course.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '8px 0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} className="text-gold" /> Duration: <strong>{course.durationHours} Hours</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <User size={13} className="text-gold" /> Lead Instructor: <strong>{course.instructor}</strong>
            </span>
          </div>

          {/* Learning Outcomes */}
          <div>
            <strong style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              Key Learning Outcomes:
            </strong>
            <ul style={{ paddingLeft: 18, fontSize: 12, color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {course.learningOutcomes.map((outcome, idx) => (
                <li key={idx}>{outcome}</li>
              ))}
            </ul>
          </div>

          {/* Course Modules & Interactive Syllabus */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Curriculum Modules ({course.modules.length}):
              </strong>
              {isEnrolled && (
                <span style={{ fontSize: 11, color: 'var(--accent-gold-dark)', fontWeight: 600 }}>
                  Progress: {enrollment.progressPercent}% ({completedIds.length}/{course.modules.length} Completed)
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {course.modules.map((mod, idx) => {
                const isModCompleted = completedIds.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    style={{
                      border: isModCompleted ? '1px solid var(--status-running-border)' : '1px solid var(--border-color)',
                      backgroundColor: isModCompleted ? '#f0fdf4' : 'var(--bg-secondary)',
                      padding: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                            {mod.title}
                          </strong>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            ({mod.durationMinutes} mins)
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                          {mod.summary}
                        </p>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', padding: 8, border: '1px solid var(--border-color)', marginBottom: 6 }}>
                          {mod.content}
                        </div>
                        {mod.keyTakeaways && mod.keyTakeaways.length > 0 && (
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            <strong>Takeaways:</strong> {mod.keyTakeaways.join(' • ')}
                          </div>
                        )}
                      </div>

                      {/* Checkbox for Member progress */}
                      {!isReadOnly && isEnrolled && (
                        <button
                          type="button"
                          className={isModCompleted ? 'btn-sm btn-accent' : 'btn-sm'}
                          onClick={() => onToggleModule(course.id, mod.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                        >
                          {isModCompleted ? (
                            <>
                              <CheckCircle2 size={13} style={{ color: 'var(--status-running)' }} />
                              Done
                            </>
                          ) : (
                            <>
                              <Circle size={13} />
                              Mark Complete
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flat-modal-footer">
          <button type="button" className="btn-sm" onClick={onClose}>
            Close
          </button>
          {!isReadOnly && !isEnrolled && (
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => onEnroll(course.id)}
            >
              Enroll in this Course
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
