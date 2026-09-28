import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../services/auth/authContext';
import { chatService } from '../../services/chatService';
import { ChatMessage } from '../../types/chat';
import { X, Send, AlertTriangle, BookOpen, FolderArchive, HelpCircle, Loader2 } from 'lucide-react';

interface KnowledgeAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse?: (courseId: string) => void;
}

const SAMPLE_PROMPTS = [
  'What templates do we have for community needs assessment?',
  'How do I calculate unit economics and COGS for my prototype?',
  'What is the structure for the Enactus National Competition pitch deck?',
  'What are the ethical requirements for 30-day community pilot trials?',
  'Where can I find the Community MoU legal template?'
];

export const KnowledgeAssistantDrawer: React.FC<KnowledgeAssistantDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      content: `Welcome to the Enactus Wits Knowledge Assistant. I can assist you with navigating our course modules, resource templates, stage-gate checklists, and financial calculators. What would you like guidance on today?`,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || !user || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const assistantResponse = await chatService.sendMessage(text, user);
      setMessages(prev => [...prev, assistantResponse]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: 'An error occurred while retrieving information. Please try again or consult the course directory directly.',
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-drawer-backdrop" onClick={onClose}>
      <div className="chat-drawer" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="chat-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="brand-badge" style={{ fontSize: 10, padding: '1px 5px' }}>ENACTUS</span>
              <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>Knowledge Assistant</strong>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Grounded on Enactus Wits Courses & Resources
            </span>
          </div>

          <button type="button" className="btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Messages List */}
        <div className="chat-messages">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            const isFlagged = msg.isFlagged;

            return (
              <div
                key={msg.id}
                className={`chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-assistant'} ${isFlagged ? 'chat-msg-flagged' : ''}`}
              >
                {/* Flagged Alert Header if flagged */}
                {isFlagged && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--status-danger)', fontSize: 11, fontWeight: 600 }}>
                    <AlertTriangle size={13} />
                    <span>Flagged for Administrator Review</span>
                  </div>
                )}

                <div style={{ whiteSpace: 'pre-line', fontSize: 13, color: 'var(--text-primary)' }}>
                  {msg.content}
                </div>

                {/* Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="chat-msg-sources">
                    <strong style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Referenced Knowledge Hub Materials:
                    </strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {msg.sources.map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {s.type === 'course' ? (
                            <BookOpen size={11} className="text-gold" />
                          ) : (
                            <FolderArchive size={11} className="text-gold" />
                          )}
                          <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>
                            [{s.type.toUpperCase()}] {s.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, textAlign: isUser ? 'right' : 'left' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="chat-msg chat-msg-assistant" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={14} className="text-gold" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Retrieving knowledge base answer...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions */}
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
            Sample Reference Queries:
          </span>
          <div className="chat-prompt-suggestions">
            {SAMPLE_PROMPTS.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="chat-prompt-chip"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="chat-input-area">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', gap: 6 }}
          >
            <input
              type="text"
              placeholder="Ask a question about courses, resources, or business stages..."
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              disabled={isLoading}
              style={{ flex: 1, backgroundColor: 'var(--bg-primary)' }}
            />
            <button
              type="submit"
              className="btn-primary btn-sm"
              disabled={isLoading || !inputQuery.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Send size={13} />
            </button>
          </form>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Queries outside the Knowledge Hub scope are automatically flagged for admin review.
          </span>
        </div>
      </div>
    </div>
  );
};
