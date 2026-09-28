import React, { useState } from 'react';
import { ResourceCategory } from '../../types/resource';
import { X, Plus, Trash2, Tag } from 'lucide-react';

interface CategoryManagerModalProps {
  categories: ResourceCategory[];
  onClose: () => void;
  onCreateCategory: (name: string, description: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  categories,
  onClose,
  onCreateCategory,
  onDeleteCategory,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateCategory(name.trim(), description.trim());
    setName('');
    setDescription('');
  };

  return (
    <div className="flat-modal-backdrop" onClick={onClose}>
      <div className="flat-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="flat-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={16} className="text-gold" />
            <strong style={{ fontSize: 14 }}>Manage Resource Categories</strong>
          </div>
          <button type="button" className="btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="flat-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Add New Category Form */}
          <form onSubmit={handleSubmit} style={{ border: '1px solid var(--border-color)', padding: 12, backgroundColor: 'var(--bg-secondary)' }}>
            <strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color: 'var(--text-primary)' }}>
              Add New Category
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="text"
                required
                placeholder="Category Name (e.g. Legal, Governance & IP)"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Short Description of this category"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <button
                type="submit"
                className="btn-primary btn-sm"
                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={12} /> Add Category
              </button>
            </div>
          </form>

          {/* Current Categories List */}
          <div>
            <strong style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              Existing Categories ({categories.length})
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {categories.map(cat => (
                <div
                  key={cat.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-primary)',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{cat.name}</strong>
                    {cat.description && (
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{cat.description}</p>
                    )}
                  </div>
                  {categories.length > 1 && (
                    <button
                      type="button"
                      className="btn-danger btn-sm"
                      onClick={() => onDeleteCategory(cat.id)}
                      title="Delete Category"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flat-modal-footer">
          <button type="button" className="btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
