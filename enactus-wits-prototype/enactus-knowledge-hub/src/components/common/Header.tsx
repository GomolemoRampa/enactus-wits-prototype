import React, { useState } from 'react';
import { useAuth } from '../../services/auth/authContext';
import { StageBadge } from './StageBadge';
import { BookOpen, FolderArchive, ShieldAlert, MessageSquare, LogOut, UserCheck, RefreshCw, ExternalLink } from 'lucide-react';
import { PersonaSwitcherModal } from '../auth/PersonaSwitcherModal';

interface HeaderProps {
  activeTab: 'courses' | 'resources' | 'admin';
  setActiveTab: (tab: 'courses' | 'resources' | 'admin') => void;
  onOpenChat: () => void;
  unreadFlaggedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenChat,
  unreadFlaggedCount = 0
}) => {
  const { user, logout, isAdmin, isSuperAdmin, isFacultyAdvisor, isMember } = useAuth();
  const [showPersonaModal, setShowPersonaModal] = useState(false);

  return (
    <header className="top-nav">
      <div className="top-nav-accent-bar" />

      {/* SSO Simulation Bar for Test Switching */}
      <div className="sso-banner">
        <div className="sso-banner-content">
          <UserCheck size={14} className="text-gold" />
          <span>
            SSO Session Active: <strong>{user?.name}</strong> ({user?.role}
            {user?.businessStageId ? ` - ${user.businessStageId} Stage` : ''})
          </span>
          {isFacultyAdvisor && (
            <span className="flat-tag" style={{ marginLeft: 6, fontSize: '10px' }}>
              Read-Only Access
            </span>
          )}
        </div>
        <div className="sso-banner-actions">
          <button
            type="button"
            className="btn-sm btn-ghost"
            onClick={() => setShowPersonaModal(true)}
            title="Switch Enactus Account Persona"
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <RefreshCw size={12} />
            Switch Persona
          </button>
        </div>
      </div>

      <div className="top-nav-inner">
        <div className="brand-section">
          <span className="brand-badge">ENACTUS WITS</span>
          <div className="brand-title">
            <span>Knowledge Hub</span>
          </div>
          <span className="brand-subtitle">Standalone Learning & Resource Portal</span>
        </div>

        <nav className="nav-links">
          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <BookOpen size={15} />
            Courses
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            <FolderArchive size={15} />
            Resources
          </button>

          {isAdmin && (
            <button
              type="button"
              className={`nav-link-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={{ position: 'relative' }}
            >
              <ShieldAlert size={15} />
              Admin Portal
              {unreadFlaggedCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--status-danger)',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    marginLeft: '4px',
                  }}
                >
                  {unreadFlaggedCount}
                </span>
              )}
            </button>
          )}

          <a
            href="http://localhost:3001"
            className="nav-link-btn"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Switch to Incubator Management Portal"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={14} />
            <span>Incubator Portal ↗</span>
          </a>
        </nav>

        <div className="nav-user-panel">
          <button
            type="button"
            className="btn-accent btn-sm"
            onClick={onOpenChat}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <MessageSquare size={14} />
            Assistant
          </button>

          <div className="user-role-badge">
            <span>{user?.name.split(' ')[0]}</span>
            {user?.businessStageId && <StageBadge stage={user.businessStageId} />}
          </div>

          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={logout}
            title="Log out of SSO session"
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      {showPersonaModal && (
        <PersonaSwitcherModal onClose={() => setShowPersonaModal(false)} />
      )}
    </header>
  );
};
