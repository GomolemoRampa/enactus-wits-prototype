import React from 'react';
import { Resource } from '../../types/resource';
import { StageBadge } from '../common/StageBadge';
import { FileText, FileSpreadsheet, Presentation, Download, ExternalLink, Tag } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onDownloadMock: (resource: Resource) => void;
  isReadOnly?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onDownloadMock,
  isReadOnly = false,
}) => {
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'Spreadsheet':
        return <FileSpreadsheet size={16} />;
      case 'Deck':
        return <Presentation size={16} />;
      case 'PDF':
      case 'Document':
      case 'Template':
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div className="resource-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div className="resource-type-icon">
          {getFileIcon(resource.fileType)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className="flat-tag font-mono" style={{ fontSize: 10 }}>
            {resource.fileType}
          </span>
          <StageBadge stage={resource.businessStage} />
        </div>
      </div>

      <h3 className="resource-title">{resource.title}</h3>
      <p className="resource-summary">{resource.summary}</p>

      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {resource.tags.map((t, idx) => (
            <span key={idx} style={{ fontSize: 10, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1px 5px' }}>
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="resource-meta">
        <div>
          <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)' }}>
            Category: <strong>{resource.category}</strong>
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {resource.fileSize ? `${resource.fileSize} • ` : ''}Added: {resource.dateAdded}
          </span>
        </div>

        <button
          type="button"
          className="btn-accent btn-sm"
          onClick={() => onDownloadMock(resource)}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Download size={12} />
          Access
        </button>
      </div>
    </div>
  );
};
