import React, { useState, useEffect } from 'react';
import { useAuth } from './services/auth/authContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PublicLandingPage } from './components/landing/PublicLandingPage';
import { CourseList } from './components/courses/CourseList';
import { ResourceList } from './components/resources/ResourceList';
import { AdminChatReview } from './components/chat/AdminChatReview';
import { AdminContentManager } from './components/admin/AdminContentManager';
import { KnowledgeAssistantDrawer } from './components/chat/KnowledgeAssistantDrawer';
import { chatService } from './services/chatService';
import { MessageSquare, BookOpen, ShieldAlert } from 'lucide-react';

// Admin Portal with sub-tabs for Content Management and Chat Review
const AdminPortal: React.FC = () => {
  const [adminSubTab, setAdminSubTab] = useState<'content' | 'chat'>('content');

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
        <button
          type="button"
          className={`nav-link-btn ${adminSubTab === 'content' ? 'active' : ''}`}
          onClick={() => setAdminSubTab('content')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
          <BookOpen size={14} /> Content Management
        </button>
        <button
          type="button"
          className={`nav-link-btn ${adminSubTab === 'chat' ? 'active' : ''}`}
          onClick={() => setAdminSubTab('chat')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
          <ShieldAlert size={14} /> Chat Review & Flagged
        </button>
      </div>

      {adminSubTab === 'content' && <AdminContentManager />}
      {adminSubTab === 'chat' && <AdminChatReview />}
    </div>
  );
};

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'courses' | 'resources' | 'admin'>('courses');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadFlaggedCount, setUnreadFlaggedCount] = useState(0);

  // Load flagged count for admins
  useEffect(() => {
    if (isAdmin) {
      chatService.getFlaggedQuestions().then(flags => {
        const pending = flags.filter(f => f.status === 'Pending Review').length;
        setUnreadFlaggedCount(pending);
      });
    }
  }, [isAdmin, activeTab, isChatOpen]);

  // If user role changes and they are no longer admin, reset activeTab to courses
  useEffect(() => {
    if (!isAdmin && activeTab === 'admin') {
      setActiveTab('courses');
    }
  }, [isAdmin, activeTab]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-badge" style={{ marginBottom: 12 }}>ENACTUS WITS</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Validating Single Sign-On Session...</p>
        </div>
      </div>
    );
  }

  // If visitor is unauthenticated, show public landing page
  if (!isAuthenticated) {
    return <PublicLandingPage />;
  }

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenChat={() => setIsChatOpen(true)}
        unreadFlaggedCount={unreadFlaggedCount}
      />

      {/* Main Workspace */}
      <main className="main-wrapper">
        {activeTab === 'courses' && <CourseList />}
        {activeTab === 'resources' && <ResourceList />}
        {activeTab === 'admin' && isAdmin && <AdminPortal />}
      </main>

      {/* Floating Chat Assistant Launcher */}
      <button
        type="button"
        className="chat-launcher-btn"
        onClick={() => setIsChatOpen(true)}
        title="Open Knowledge Assistant"
      >
        <MessageSquare size={16} className="text-gold" />
        <span>Knowledge Assistant</span>
      </button>

      {/* Collapsible Chat Drawer */}
      <KnowledgeAssistantDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};
