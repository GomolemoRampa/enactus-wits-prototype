import React, { useState, useEffect } from 'react';
import { Resource, ResourceCategory, ResourceBusinessStage } from '../../types/resource';
import { resourceService } from '../../services/resourceService';
import { useAuth } from '../../services/auth/authContext';
import { ResourceCard } from './ResourceCard';
import { ResourceAdminModal } from './ResourceAdminModal';
import { CategoryManagerModal } from './CategoryManagerModal';
import { Search, Plus, FolderArchive, Tag, Edit2, Trash2, Filter, CheckCircle2 } from 'lucide-react';

export const ResourceList: React.FC = () => {
  const { user, isAdmin, isReadOnly } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  
  // Filtering state
  const defaultStage = user?.businessStageId || 'All';
  const [selectedStage, setSelectedStage] = useState<ResourceBusinessStage | 'All'>(defaultStage);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isResourceAdminModalOpen, setIsResourceAdminModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [res, cats] = await Promise.all([
        resourceService.fetchResources(),
        resourceService.fetchCategories(),
      ]);
      setResources(res);
      setCategories(cats);
    } catch (e) {
      setResources(resourceService.getResources());
      setCategories(resourceService.getCategories());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user?.businessStageId) {
      setSelectedStage(user.businessStageId);
    } else {
      setSelectedStage('All');
    }
  }, [user?.id, user?.businessStageId]);

  const filteredResources = resourceService.filterResources({
    stage: selectedStage,
    category: selectedCategory,
    searchQuery,
  });

  const handleDownload = (resource: Resource) => {
    if (resource.downloadUrl && resource.downloadUrl !== '#') {
      window.open(resource.downloadUrl, '_blank');
    }
    setDownloadToast(`Opening "${resource.title}" (${resource.fileType}).`);
    setTimeout(() => {
      setDownloadToast(null);
    }, 4000);
  };

  const handleSaveResource = async (data: Omit<Resource, 'id' | 'dateAdded'>) => {
    if (resourceToEdit) {
      await resourceService.updateResource(resourceToEdit.id, data);
    } else {
      await resourceService.createResource(data, user?.id ? Number(user.id) : 2);
    }
    setIsResourceAdminModalOpen(false);
    setResourceToEdit(null);
    loadData();
  };

  const handleDeleteResource = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this resource?')) {
      await resourceService.deleteResource(id);
      loadData();
    }
  };

  const handleCreateCategory = async (name: string, description: string) => {
    await resourceService.createCategory(name, description);
    loadData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await resourceService.deleteCategory(id);
      loadData();
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Enactus Resource & Template Repository</h1>
          <p>
            Standardized questionnaires, financial workbooks, legal MoUs, and competition slide masters.
            {user?.businessStageId && (
              <span> Auto-filtered to your project stage: <strong>{user.businessStageId}</strong>.</span>
            )}
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn-sm"
              onClick={() => setIsCategoryModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Tag size={13} /> Manage Categories
            </button>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => {
                setResourceToEdit(null);
                setIsResourceAdminModalOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} /> Post New Resource
            </button>
          </div>
        )}
      </div>

      {/* Access/Download Feedback Toast */}
      {downloadToast && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid var(--status-running-border)', color: 'var(--status-running)', padding: '8px 12px', fontSize: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={14} />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-row-primary">
          <div className="search-input-group">
            <Search size={14} className="search-icon-fixed" />
            <input
              type="search"
              placeholder="Search resources by title, keywords, tags, author..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

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

        {/* Category Chips */}
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

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="flat-card" style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg-secondary)' }}>
          <FolderArchive size={24} className="text-muted" style={{ margin: '0 auto 8px' }} />
          <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block' }}>
            No resources found matching filters
          </strong>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Try resetting your category or business stage filter.
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
          {filteredResources.map(resource => (
            <div key={resource.id} style={{ position: 'relative' }}>
              <ResourceCard
                resource={resource}
                onDownloadMock={handleDownload}
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
                      setResourceToEdit(resource);
                      setIsResourceAdminModalOpen(true);
                    }}
                    title="Edit Resource"
                    style={{ padding: '2px 6px', backgroundColor: 'var(--bg-primary)' }}
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    type="button"
                    className="btn-danger btn-sm"
                    onClick={() => handleDeleteResource(resource.id)}
                    title="Delete Resource"
                    style={{ padding: '2px 6px' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Modals */}
      {isResourceAdminModalOpen && (
        <ResourceAdminModal
          resourceToEdit={resourceToEdit}
          categories={categories}
          onClose={() => {
            setIsResourceAdminModalOpen(false);
            setResourceToEdit(null);
          }}
          onSave={handleSaveResource}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryManagerModal
          categories={categories}
          onClose={() => setIsCategoryModalOpen(false)}
          onCreateCategory={handleCreateCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}
    </div>
  );
};
