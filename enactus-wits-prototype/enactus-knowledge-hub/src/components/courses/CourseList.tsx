import React, { useState, useEffect } from 'react';
import { Course, CourseBusinessStage, UserEnrollment } from '../../types/course';
import { ResourceCategory } from '../../types/resource';
import { courseService } from '../../services/courseService';
import { resourceService } from '../../services/resourceService';
import { useAuth } from '../../services/auth/authContext';
import { CourseCard } from './CourseCard';
import { CourseDetailModal } from './CourseDetailModal';
import { CourseAdminModal } from './CourseAdminModal';
import { Search, Plus, BookOpen, Edit2, Trash2, Filter } from 'lucide-react';

export const CourseList: React.FC = () => {
  const { user, isAdmin, isReadOnly } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [enrollments, setEnrollments] = useState<UserEnrollment[]>([]);
  
  // Filtering state: auto-filter to member's businessStageId by default
  const defaultStage = user?.businessStageId || 'All';
  const [selectedStage, setSelectedStage] = useState<CourseBusinessStage | 'All'>(defaultStage);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [isCourseAdminModalOpen, setIsCourseAdminModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const loadData = () => {
    setCourses(courseService.getCourses());
    setCategories(resourceService.getCategories());
    if (user) {
      setEnrollments(courseService.getUserEnrollments(user.id));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // When user changes (e.g. persona switch), reset default filter to user's stage
  useEffect(() => {
    if (user?.businessStageId) {
      setSelectedStage(user.businessStageId);
    } else {
      setSelectedStage('All');
    }
  }, [user?.id, user?.businessStageId]);

  const filteredCourses = courseService.filterCourses({
    stage: selectedStage,
    category: selectedCategory,
    searchQuery,
  });

  const handleEnroll = (courseId: string) => {
    if (!user) return;
    const updated = courseService.enrollInCourse(user.id, courseId);
    setEnrollments(courseService.getUserEnrollments(user.id));
    // If modal open, keep synced
    if (selectedCourseForDetail && selectedCourseForDetail.id === courseId) {
      // Re-trigger re-render
    }
  };

  const handleToggleModule = (courseId: string, moduleId: string) => {
    if (!user) return;
    courseService.toggleModuleCompletion(user.id, courseId, moduleId);
    setEnrollments(courseService.getUserEnrollments(user.id));
  };

  const handleSaveCourse = (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (courseToEdit) {
      courseService.updateCourse(courseToEdit.id, data);
    } else {
      courseService.createCourse(data);
    }
    setIsCourseAdminModalOpen(false);
    setCourseToEdit(null);
    loadData();
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to remove this course from the Knowledge Hub?')) {
      courseService.deleteCourse(courseId);
      loadData();
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Enactus Training Courses</h1>
          <p>
            Curriculum modules structured around social business stages.
            {user?.businessStageId && (
              <span> Auto-filtered to your project stage: <strong>{user.businessStageId}</strong>.</span>
            )}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => {
              setCourseToEdit(null);
              setIsCourseAdminModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={14} /> Add New Course
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-row-primary">
          {/* Search Box */}
          <div className="search-input-group">
            <Search size={14} className="search-icon-fixed" />
            <input
              type="search"
              placeholder="Search courses by keyword, topic, instructor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Stage Tabs (Auto-filter by default + manual override) */}
          <div className="stage-tab-group">
            <button
              type="button"
              className={`stage-tab-btn ${selectedStage === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedStage('All')}
            >
              All Stages
            </button>
            <button
              type="button"
              className={`stage-tab-btn ${selectedStage === 'Idea' ? 'active' : ''}`}
              onClick={() => setSelectedStage('Idea')}
            >
              Idea {user?.businessStageId === 'Idea' && '• (My Stage)'}
            </button>
            <button
              type="button"
              className={`stage-tab-btn ${selectedStage === 'Prototype' ? 'active' : ''}`}
              onClick={() => setSelectedStage('Prototype')}
            >
              Prototype {user?.businessStageId === 'Prototype' && '• (My Stage)'}
            </button>
            <button
              type="button"
              className={`stage-tab-btn ${selectedStage === 'Running Business' ? 'active' : ''}`}
              onClick={() => setSelectedStage('Running Business')}
            >
              Running Business {user?.businessStageId === 'Running Business' && '• (My Stage)'}
            </button>
          </div>
        </div>

        {/* Category Chips Filter */}
        <div className="category-chips-row">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={12} /> Category:
          </span>
          <button
            type="button"
            className={`category-chip ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`category-chip ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="flat-card" style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg-secondary)' }}>
          <BookOpen size={24} className="text-muted" style={{ margin: '0 auto 8px' }} />
          <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block' }}>
            No courses found matching current filters
          </strong>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Try selecting "All Stages" or clearing your search keywords.
          </p>
          <button
            type="button"
            className="btn-sm"
            onClick={() => {
              setSelectedStage('All');
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            style={{ marginTop: 12 }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredCourses.map(course => {
            const userEnrollment = enrollments.find(e => e.courseId === course.id);
            return (
              <div key={course.id} style={{ position: 'relative' }}>
                <CourseCard
                  course={course}
                  enrollment={userEnrollment}
                  onOpenDetails={c => setSelectedCourseForDetail(c)}
                  onEnroll={handleEnroll}
                  isReadOnly={isReadOnly}
                />

                {isAdmin && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      display: 'flex',
                      gap: 4,
                      zIndex: 2,
                    }}
                  >
                    <button
                      type="button"
                      className="btn-sm btn-ghost"
                      onClick={() => {
                        setCourseToEdit(course);
                        setIsCourseAdminModalOpen(true);
                      }}
                      title="Edit Course"
                      style={{ padding: '2px 6px', backgroundColor: 'var(--bg-primary)' }}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      className="btn-danger btn-sm"
                      onClick={() => handleDeleteCourse(course.id)}
                      title="Delete Course"
                      style={{ padding: '2px 6px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedCourseForDetail && (
        <CourseDetailModal
          course={selectedCourseForDetail}
          enrollment={enrollments.find(e => e.courseId === selectedCourseForDetail.id)}
          onClose={() => setSelectedCourseForDetail(null)}
          onEnroll={handleEnroll}
          onToggleModule={handleToggleModule}
          isReadOnly={isReadOnly}
        />
      )}

      {isCourseAdminModalOpen && (
        <CourseAdminModal
          courseToEdit={courseToEdit}
          categories={categories}
          onClose={() => {
            setIsCourseAdminModalOpen(false);
            setCourseToEdit(null);
          }}
          onSave={handleSaveCourse}
        />
      )}
    </div>
  );
};
