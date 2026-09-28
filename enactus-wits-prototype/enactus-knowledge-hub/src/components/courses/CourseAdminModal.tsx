import React, { useState } from 'react';
import { Course, CourseBusinessStage, CourseModule } from '../../types/course';
import { ResourceCategory } from '../../types/resource';
import { X, Plus, Trash2, BookOpen } from 'lucide-react';

interface CourseAdminModalProps {
  courseToEdit?: Course | null;
  categories: ResourceCategory[];
  onClose: () => void;
  onSave: (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const CourseAdminModal: React.FC<CourseAdminModalProps> = ({
  courseToEdit,
  categories,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(courseToEdit?.title || '');
  const [description, setDescription] = useState(courseToEdit?.description || '');
  const [category, setCategory] = useState(courseToEdit?.category || categories[0]?.name || 'Needs Assessment & Problem Discovery');
  const [businessStage, setBusinessStage] = useState<CourseBusinessStage>(courseToEdit?.businessStage || 'Idea');
  const [durationHours, setDurationHours] = useState<number>(courseToEdit?.durationHours || 4);
  const [instructor, setInstructor] = useState(courseToEdit?.instructor || 'Enactus Wits Training Lead');
  const [learningOutcomesText, setLearningOutcomesText] = useState(
    courseToEdit?.learningOutcomes?.join('\n') || 'Understand core fundamentals\nApply frameworks to community projects'
  );

  const [modules, setModules] = useState<CourseModule[]>(
    courseToEdit?.modules || [
      {
        id: `mod-${Date.now()}-1`,
        title: 'Module 1: Foundations & Framework Overview',
        durationMinutes: 45,
        summary: 'Introductory module covering stage-gate requirements.',
        content: 'Detailed instruction text for module 1.',
        keyTakeaways: ['Key takeaway 1', 'Key takeaway 2'],
      }
    ]
  );

  const handleAddModule = () => {
    setModules([
      ...modules,
      {
        id: `mod-${Date.now()}-${modules.length + 1}`,
        title: `Module ${modules.length + 1}: New Topic`,
        durationMinutes: 60,
        summary: 'Summary of the module topic.',
        content: 'In-depth content and methodology guidelines.',
        keyTakeaways: ['Core lesson point'],
      }
    ]);
  };

  const handleUpdateModule = (idx: number, field: keyof CourseModule, value: any) => {
    const next = [...modules];
    next[idx] = { ...next[idx], [field]: value };
    setModules(next);
  };

  const handleRemoveModule = (idx: number) => {
    if (modules.length <= 1) return;
    setModules(modules.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please provide course title and description.');
      return;
    }

    const learningOutcomes = learningOutcomesText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      businessStage,
      durationHours: Number(durationHours) || 1,
      instructor: instructor.trim(),
      learningOutcomes,
      modules,
    });
  };

  return (
    <div className="flat-modal-backdrop" onClick={onClose}>
      <div className="flat-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 760 }}>
        <div className="flat-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={16} className="text-gold" />
            <strong style={{ fontSize: 14 }}>
              {courseToEdit ? 'Edit Enactus Course' : 'Create New Enactus Course'}
            </strong>
          </div>
          <button type="button" className="btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flat-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Course Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Social Need Identification & Root Cause Analysis"
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Course Summary / Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Comprehensive description of the course scope..."
            />
          </div>

          {/* Category & Stage Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Category
              </label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Business Stage Tag
              </label>
              <select
                value={businessStage}
                onChange={e => setBusinessStage(e.target.value as CourseBusinessStage)}
              >
                <option value="Idea">Idea Stage</option>
                <option value="Prototype">Prototype Stage</option>
                <option value="Running Business">Running Business Stage</option>
                <option value="All Stages">All Stages (Cross-Cutting)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={durationHours}
                onChange={e => setDurationHours(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Lead Instructor
              </label>
              <input
                type="text"
                value={instructor}
                onChange={e => setInstructor(e.target.value)}
                placeholder="Instructor or Team Name"
              />
            </div>
          </div>

          {/* Learning Outcomes */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Learning Outcomes (One per line)
            </label>
            <textarea
              rows={3}
              value={learningOutcomesText}
              onChange={e => setLearningOutcomesText(e.target.value)}
              placeholder="Conduct rigorous community interviews..."
            />
          </div>

          {/* Modules Builder */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Course Modules ({modules.length})
              </label>
              <button
                type="button"
                className="btn-sm btn-ghost"
                onClick={handleAddModule}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={12} /> Add Module
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {modules.map((m, idx) => (
                <div key={m.id} style={{ border: '1px solid var(--border-color)', padding: 10, backgroundColor: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <input
                      type="text"
                      value={m.title}
                      onChange={e => handleUpdateModule(idx, 'title', e.target.value)}
                      placeholder="Module Title"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={m.durationMinutes}
                      onChange={e => handleUpdateModule(idx, 'durationMinutes', parseInt(e.target.value) || 30)}
                      placeholder="Mins"
                      style={{ width: 80 }}
                    />
                    {modules.length > 1 && (
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        onClick={() => handleRemoveModule(idx)}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={m.content}
                    onChange={e => handleUpdateModule(idx, 'content', e.target.value)}
                    placeholder="Module Content & Instruction Guidelines..."
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flat-modal-footer" style={{ margin: '-16px -16px -16px -16px', marginTop: 12 }}>
            <button type="button" className="btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-sm">
              {courseToEdit ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
