import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/auth/authContext';
import { courseService } from '../../services/courseService';
import { resourceService } from '../../services/resourceService';
import { Course, CourseBusinessStage, CourseModule } from '../../types/course';
import { Resource, ResourceFileType, ResourceBusinessStage } from '../../types/resource';
import { StageBadge } from '../common/StageBadge';
import {
  Plus, Trash2, BookOpen, FolderArchive, X, Save, ChevronDown, ChevronUp, Edit3, AlertTriangle
} from 'lucide-react';

const STAGES: CourseBusinessStage[] = ['Idea', 'Prototype', 'Running Business', 'All Stages'];
const FILE_TYPES: ResourceFileType[] = ['PDF', 'Template', 'Spreadsheet', 'Guide', 'Deck', 'Document', 'Link'];

// ─── Shared Components ──────────────────────────────────────────────────────

function ConfirmDeleteModal({ itemName, onConfirm, onCancel }: { itemName: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flat-modal-backdrop" onClick={onCancel}>
      <div className="flat-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="flat-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} style={{ color: 'var(--status-danger)' }} />
            <strong style={{ fontSize: 14 }}>Confirm Deletion</strong>
          </div>
          <button type="button" className="btn-ghost btn-sm" onClick={onCancel}><X size={16} /></button>
        </div>
        <div className="flat-modal-body">
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Are you sure you want to permanently delete <strong>"{itemName}"</strong>? This action cannot be undone.
          </p>
        </div>
        <div className="flat-modal-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="btn-sm" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn-sm" onClick={onConfirm}
            style={{ background: 'var(--status-danger)', color: '#fff', border: 'none' }}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: 'var(--accent-gold)', color: '#1a1400', padding: '10px 20px',
      borderRadius: 6, fontSize: 13, fontWeight: 600,
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)', animation: 'slideDownBanner 0.3s ease-out',
    }}>
      {message}
    </div>
  );
}

// ─── Course Form ──────────────────────────────────────────────────────────

function CourseForm({ onSave, onCancel, initial }: {
  onSave: (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initial?: Course;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState(initial?.category || 'Business Development');
  const [stage, setStage] = useState<CourseBusinessStage>(initial?.businessStage || 'All Stages');
  const [instructor, setInstructor] = useState(initial?.instructor || '');
  const [durationHours, setDurationHours] = useState(initial?.durationHours || 1);
  const [outcomes, setOutcomes] = useState(initial?.learningOutcomes?.join('\n') || '');
  const [modules, setModules] = useState<CourseModule[]>(initial?.modules || []);

  const addModule = () => {
    setModules(prev => [...prev, {
      id: `mod-${Date.now()}`,
      title: '',
      durationMinutes: 30,
      summary: '',
      content: '',
      keyTakeaways: [],
    }]);
  };

  const updateModule = (index: number, field: keyof CourseModule, value: any) => {
    setModules(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const removeModule = (index: number) => {
    setModules(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      businessStage: stage,
      instructor: instructor.trim() || 'Enactus Wits Faculty',
      durationHours,
      modules,
      learningOutcomes: outcomes.split('\n').map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="flat-modal-backdrop" onClick={onCancel}>
      <div className="flat-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 680, maxHeight: '85vh', overflow: 'auto' }}>
        <div className="flat-modal-header">
          <strong style={{ fontSize: 14 }}>{initial ? 'Edit Course' : 'Add New Course'}</strong>
          <button type="button" className="btn-ghost btn-sm" onClick={onCancel}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flat-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div>
              <label style={labelStyle}>Course Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="e.g. Business Model Canvas Workshop" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Description *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} required
                placeholder="A brief description of what this course covers..." style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Business Stage *</label>
                <select value={stage} onChange={e => setStage(e.target.value as CourseBusinessStage)} style={inputStyle}>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}
                  placeholder="e.g. Financial Literacy" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Instructor</label>
                <input type="text" value={instructor} onChange={e => setInstructor(e.target.value)} style={inputStyle}
                  placeholder="Instructor name" />
              </div>
              <div>
                <label style={labelStyle}>Duration (Hours)</label>
                <input type="number" min={0.5} step={0.5} value={durationHours}
                  onChange={e => setDurationHours(Number(e.target.value))} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Learning Outcomes (one per line)</label>
              <textarea value={outcomes} onChange={e => setOutcomes(e.target.value)} rows={3}
                placeholder="Understand unit economics&#10;Build a financial model&#10;..." style={inputStyle} />
            </div>

            {/* Modules */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Course Modules ({modules.length})</label>
                <button type="button" className="btn-sm" onClick={addModule}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                  <Plus size={12} /> Add Module
                </button>
              </div>
              {modules.map((mod, idx) => (
                <div key={mod.id} style={{
                  border: '1px solid var(--border-color)', padding: 12, marginBottom: 8,
                  backgroundColor: 'var(--bg-primary)', borderRadius: 4,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Module {idx + 1}</strong>
                    <button type="button" onClick={() => removeModule(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-danger)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <input type="text" placeholder="Module title" value={mod.title}
                    onChange={e => updateModule(idx, 'title', e.target.value)}
                    style={{ ...inputStyle, marginBottom: 6 }} />
                  <textarea placeholder="Module content / lesson notes" value={mod.content}
                    onChange={e => updateModule(idx, 'content', e.target.value)}
                    rows={2} style={{ ...inputStyle, marginBottom: 6 }} />
                  <input type="number" placeholder="Duration (min)" value={mod.durationMinutes}
                    onChange={e => updateModule(idx, 'durationMinutes', Number(e.target.value))}
                    style={{ ...inputStyle, width: 140 }} min={1} />
                </div>
              ))}
            </div>
          </div>

          <div className="flat-modal-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-sm" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Save size={13} /> {initial ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Resource Form ──────────────────────────────────────────────────────────

function ResourceForm({ onSave, onCancel, initial }: {
  onSave: (data: Omit<Resource, 'id' | 'dateAdded'>) => void;
  onCancel: () => void;
  initial?: Resource;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [summary, setSummary] = useState(initial?.summary || '');
  const [fileType, setFileType] = useState<ResourceFileType>(initial?.fileType || 'Document');
  const [stage, setStage] = useState<ResourceBusinessStage>(initial?.businessStage || 'All Stages');
  const [category, setCategory] = useState(initial?.category || '');
  const [author, setAuthor] = useState(initial?.author || '');
  const [downloadUrl, setDownloadUrl] = useState(initial?.downloadUrl || '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    onSave({
      title: title.trim(),
      summary: summary.trim(),
      fileType,
      businessStage: stage,
      category: category.trim() || 'General',
      author: author.trim() || 'Enactus Wits Faculty',
      downloadUrl: downloadUrl.trim() || '#',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="flat-modal-backdrop" onClick={onCancel}>
      <div className="flat-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580, maxHeight: '85vh', overflow: 'auto' }}>
        <div className="flat-modal-header">
          <strong style={{ fontSize: 14 }}>{initial ? 'Edit Resource' : 'Upload New Resource'}</strong>
          <button type="button" className="btn-ghost btn-sm" onClick={onCancel}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flat-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Resource Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="e.g. Financial Statement Template" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Summary / Description *</label>
              <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} required
                placeholder="What this resource covers..." style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Business Stage *</label>
                <select value={stage} onChange={e => setStage(e.target.value as ResourceBusinessStage)} style={inputStyle}>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>File Type</label>
                <select value={fileType} onChange={e => setFileType(e.target.value as ResourceFileType)} style={inputStyle}>
                  {FILE_TYPES.map(ft => <option key={ft} value={ft}>{ft}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}
                  placeholder="e.g. Legal & Compliance" />
              </div>
              <div>
                <label style={labelStyle}>Author</label>
                <input type="text" value={author} onChange={e => setAuthor(e.target.value)} style={inputStyle}
                  placeholder="Author name" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Download / Link URL</label>
              <input type="url" value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)} style={inputStyle}
                placeholder="https://..." />
            </div>

            <div>
              <label style={labelStyle}>Tags (comma-separated)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} style={inputStyle}
                placeholder="e.g. template, finance, compliance" />
            </div>
          </div>

          <div className="flat-modal-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-sm" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Save size={13} /> {initial ? 'Save Changes' : 'Upload Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Inline Styles ──────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  color: 'var(--text-secondary)', display: 'block', marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px',
  backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)',
  borderRadius: 4, color: 'var(--text-primary)', fontSize: 13,
};

// ─── Main Admin Content Manager ──────────────────────────────────────────────

export const AdminContentManager: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [subTab, setSubTab] = useState<'courses' | 'resources'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [editingResource, setEditingResource] = useState<Resource | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'course' | 'resource'; id: string; name: string } | null>(null);
  const [toast, setToast] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');

  const loadData = () => {
    setCourses(courseService.getCourses());
    setResources(resourceService.getResources());
  };

  useEffect(() => { loadData(); }, []);

  if (!isAdmin) return null;

  // ── Course CRUD ─────────────────────────────────────────────────────────
  const handleCreateCourse = (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
    courseService.createCourse(data);
    setShowCourseForm(false);
    setEditingCourse(undefined);
    loadData();
    setToast('Course created successfully.');
  };

  const handleEditCourse = (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCourse) {
      courseService.updateCourse(editingCourse.id, data);
    }
    setShowCourseForm(false);
    setEditingCourse(undefined);
    loadData();
    setToast('Course updated successfully.');
  };

  const handleDeleteCourse = (id: string) => {
    courseService.deleteCourse(id);
    setDeleteTarget(null);
    loadData();
    setToast('Course deleted.');
  };

  // ── Resource CRUD ───────────────────────────────────────────────────────
  const handleCreateResource = async (data: Omit<Resource, 'id' | 'dateAdded'>) => {
    try {
      await resourceService.createResource(data);
      setShowResourceForm(false);
      setEditingResource(undefined);
      loadData();
      setToast('Resource uploaded successfully.');
    } catch (error: any) {
      setToast(`Error uploading resource: ${error.message || 'Database error'}`);
    }
  };

  const handleEditResource = async (data: Omit<Resource, 'id' | 'dateAdded'>) => {
    try {
      if (editingResource) {
        await resourceService.updateResource(editingResource.id, data);
      }
      setShowResourceForm(false);
      setEditingResource(undefined);
      loadData();
      setToast('Resource updated successfully.');
    } catch (error: any) {
      setToast(`Error updating resource: ${error.message || 'Database error'}`);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await resourceService.deleteResource(id);
      setDeleteTarget(null);
      loadData();
      setToast('Resource deleted.');
    } catch (error: any) {
      setToast(`Error deleting resource: ${error.message || 'Database error'}`);
      setDeleteTarget(null);
    }
  };

  // Filter
  const filteredCourses = stageFilter === 'All' ? courses : courses.filter(c => c.businessStage === stageFilter || c.businessStage === 'All Stages');
  const filteredResources = stageFilter === 'All' ? resources : resources.filter(r => r.businessStage === stageFilter || r.businessStage === 'All Stages');

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Content Management
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Upload, edit, and remove courses and resources for the Knowledge Hub.
        </p>
      </div>

      {/* Sub-tabs and actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button"
            className={`nav-link-btn ${subTab === 'courses' ? 'active' : ''}`}
            onClick={() => setSubTab('courses')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
            <BookOpen size={14} /> Courses ({filteredCourses.length})
          </button>
          <button type="button"
            className={`nav-link-btn ${subTab === 'resources' ? 'active' : ''}`}
            onClick={() => setSubTab('resources')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
            <FolderArchive size={14} /> Resources ({filteredResources.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
            style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: 12 }}>
            <option value="All">All Stages</option>
            {STAGES.filter(s => s !== 'All Stages').map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button type="button" className="btn-primary btn-sm"
            onClick={() => {
              if (subTab === 'courses') { setEditingCourse(undefined); setShowCourseForm(true); }
              else { setEditingResource(undefined); setShowResourceForm(true); }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            <Plus size={14} />
            {subTab === 'courses' ? 'Add Course' : 'Upload Resource'}
          </button>
        </div>
      </div>

      {/* Courses Table */}
      {subTab === 'courses' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Stage</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Modules</th>
                <th style={thStyle}>Updated</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No courses found for this stage.</td></tr>
              ) : filteredCourses.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={tdStyle}>
                    <strong>{c.title}</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.instructor}</div>
                  </td>
                  <td style={tdStyle}><StageBadge stage={c.businessStage} /></td>
                  <td style={tdStyle}>{c.category}</td>
                  <td style={tdStyle}>{c.modules.length}</td>
                  <td style={tdStyle}>{c.updatedAt}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button type="button" className="btn-sm btn-ghost"
                        onClick={() => { setEditingCourse(c); setShowCourseForm(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Edit3 size={12} /> Edit
                      </button>
                      <button type="button" className="btn-sm btn-ghost"
                        onClick={() => setDeleteTarget({ type: 'course', id: c.id, name: c.title })}
                        style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--status-danger)' }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resources Table */}
      {subTab === 'resources' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Stage</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Added</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No resources found for this stage.</td></tr>
              ) : filteredResources.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={tdStyle}>
                    <strong>{r.title}</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.author}</div>
                  </td>
                  <td style={tdStyle}><StageBadge stage={r.businessStage} /></td>
                  <td style={tdStyle}>{r.category}</td>
                  <td style={tdStyle}>
                    <span className="flat-tag" style={{ fontSize: 10 }}>{r.fileType}</span>
                  </td>
                  <td style={tdStyle}>{r.dateAdded}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button type="button" className="btn-sm btn-ghost"
                        onClick={() => { setEditingResource(r); setShowResourceForm(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Edit3 size={12} /> Edit
                      </button>
                      <button type="button" className="btn-sm btn-ghost"
                        onClick={() => setDeleteTarget({ type: 'resource', id: r.id, name: r.title })}
                        style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--status-danger)' }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showCourseForm && (
        <CourseForm
          initial={editingCourse}
          onSave={editingCourse ? handleEditCourse : handleCreateCourse}
          onCancel={() => { setShowCourseForm(false); setEditingCourse(undefined); }}
        />
      )}

      {showResourceForm && (
        <ResourceForm
          initial={editingResource}
          onSave={editingResource ? handleEditResource : handleCreateResource}
          onCancel={() => { setShowResourceForm(false); setEditingResource(undefined); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          itemName={deleteTarget.name}
          onConfirm={() => deleteTarget.type === 'course'
            ? handleDeleteCourse(deleteTarget.id)
            : handleDeleteResource(deleteTarget.id)
          }
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
    </>
  );
};

const thStyle: React.CSSProperties = {
  padding: '10px 12px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  color: 'var(--text-secondary)', letterSpacing: '0.3px',
};

const tdStyle: React.CSSProperties = {
  padding: '12px', verticalAlign: 'middle',
};
