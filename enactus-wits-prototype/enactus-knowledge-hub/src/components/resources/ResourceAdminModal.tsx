import React, { useState } from 'react';
import { Resource, ResourceBusinessStage, ResourceFileType, ResourceCategory } from '../../types/resource';
import { X, Upload, Plus } from 'lucide-react';

interface ResourceAdminModalProps {
  resourceToEdit?: Resource | null;
  categories: ResourceCategory[];
  onClose: () => void;
  onSave: (resData: Omit<Resource, 'id' | 'dateAdded'>) => void;
}

export const ResourceAdminModal: React.FC<ResourceAdminModalProps> = ({
  resourceToEdit,
  categories,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(resourceToEdit?.title || '');
  const [summary, setSummary] = useState(resourceToEdit?.summary || '');
  const [fileType, setFileType] = useState<ResourceFileType>(resourceToEdit?.fileType || 'PDF');
  const [businessStage, setBusinessStage] = useState<ResourceBusinessStage>(resourceToEdit?.businessStage || 'Idea');
  const [category, setCategory] = useState(resourceToEdit?.category || categories[0]?.name || 'Needs Assessment & Problem Discovery');
  const [author, setAuthor] = useState(resourceToEdit?.author || 'Enactus Wits Knowledge Directorate');
  const [fileSize, setFileSize] = useState(resourceToEdit?.fileSize || '1.4 MB');
  const [downloadUrl, setDownloadUrl] = useState(resourceToEdit?.downloadUrl || '#download-doc');
  const [tagsText, setTagsText] = useState(resourceToEdit?.tags?.join(', ') || 'Templates, Guidelines, Stage Gate');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      alert('Please fill in title and summary.');
      return;
    }

    const tags = tagsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    onSave({
      title: title.trim(),
      summary: summary.trim(),
      fileType,
      businessStage,
      category,
      author: author.trim(),
      fileSize: fileSize.trim(),
      downloadUrl: downloadUrl.trim(),
      tags,
    });
  };

  return (
    <div className="flat-modal-backdrop" onClick={onClose}>
      <div className="flat-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="flat-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={16} className="text-gold" />
            <strong style={{ fontSize: 14 }}>
              {resourceToEdit ? 'Edit Resource' : 'Post / Upload New Resource'}
            </strong>
          </div>
          <button type="button" className="btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flat-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Resource Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 30-Day Prototype Pilot Checklist & Metric Log"
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Summary & Instructions *
            </label>
            <textarea
              required
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Describe what this resource contains and how members should use it..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                onChange={e => setBusinessStage(e.target.value as ResourceBusinessStage)}
              >
                <option value="Idea">Idea Stage</option>
                <option value="Prototype">Prototype Stage</option>
                <option value="Running Business">Running Business Stage</option>
                <option value="All Stages">All Stages</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                File / Document Type
              </label>
              <select
                value={fileType}
                onChange={e => setFileType(e.target.value as ResourceFileType)}
              >
                <option value="PDF">PDF Document</option>
                <option value="Spreadsheet">Excel / Spreadsheet</option>
                <option value="Template">Document Template</option>
                <option value="Deck">Slide Deck (PPTX)</option>
                <option value="Guide">Handbook / Guide</option>
                <option value="Link">External Link</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                File Size / Format
              </label>
              <input
                type="text"
                value={fileSize}
                onChange={e => setFileSize(e.target.value)}
                placeholder="e.g. 520 KB"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Author / Source Organization
            </label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="e.g. Enactus South Africa Training Directorate"
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Search Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsText}
              onChange={e => setTagsText(e.target.value)}
              placeholder="Needs Assessment, Interviews, Stage Gate"
            />
          </div>

          <div className="flat-modal-footer" style={{ margin: '-16px -16px -16px -16px', marginTop: 10 }}>
            <button type="button" className="btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-sm">
              {resourceToEdit ? 'Save Changes' : 'Publish Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
