import React, { useState, useEffect } from 'react';
import { useAuth } from './services/auth/authContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PublicLandingPage } from './components/landing/PublicLandingPage';
import { CourseList } from './components/courses/CourseList';
import { ResourceList } from './components/resources/ResourceList';
import { AdminChatReview } from './components/chat/AdminChatReview';
import { KnowledgeAssistantDrawer } from './components/chat/KnowledgeAssistantDrawer';
import { chatService } from './services/chatService';
import { MessageSquare } from 'lucide-react';

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
        {activeTab === 'admin' && isAdmin && <AdminChatReview />}
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
