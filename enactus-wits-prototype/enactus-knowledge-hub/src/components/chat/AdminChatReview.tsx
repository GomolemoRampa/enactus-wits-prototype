import React, { useState, useEffect } from 'react';
import { FlaggedQuestion, ChatInteractionLog } from '../../types/chat';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../services/auth/authContext';
import { StageBadge } from '../common/StageBadge';
import { ShieldAlert, AlertTriangle, CheckCircle, MessageSquare, RefreshCw, X, Check, Clock } from 'lucide-react';

export const AdminChatReview: React.FC = () => {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState<'flagged' | 'logs'>('flagged');
  const [flaggedQuestions, setFlaggedQuestions] = useState<FlaggedQuestion[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatInteractionLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Selected flagged question for review modal
  const [reviewingFlag, setReviewingFlag] = useState<FlaggedQuestion | null>(null);
  const [adminAnswerText, setAdminAnswerText] = useState('');
  const [adminNotesText, setAdminNotesText] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [flags, logs] = await Promise.all([
        chatService.getFlaggedQuestions(),
        chatService.getChatLogs(),
      ]);
      setFlaggedQuestions(flags);
      setChatLogs(logs);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenReview = (flag: FlaggedQuestion) => {
    setReviewingFlag(flag);
    setAdminAnswerText(flag.adminAnswer || '');
    setAdminNotesText(flag.adminNotes || '');
  };

  const handleSaveReview = async (status: 'Answered' | 'Dismissed') => {
    if (!reviewingFlag || !user) return;
    await chatService.updateFlaggedQuestion(reviewingFlag.id, {
      status,
      adminAnswer: adminAnswerText.trim(),
      adminNotes: adminNotesText.trim(),
      reviewedBy: `${user.name} (${user.role})`,
    });
    setReviewingFlag(null);
    loadData();
  };

  const pendingCount = flaggedQuestions.filter(f => f.status === 'Pending Review').length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Knowledge Assistant Oversight & Flagged Queries</h1>
          <p>
            Audit member inquiries, review out-of-scope/unconfident questions, and expand knowledge base coverage.
          </p>
        </div>

        <button
          type="button"
          className="btn-sm"
          onClick={loadData}
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={12} className={isLoading ? 'spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* Sub Tab Navigation */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
        <button
          type="button"
          className={subTab === 'flagged' ? 'btn-primary btn-sm' : 'btn-sm'}
          onClick={() => setSubTab('flagged')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <AlertTriangle size={13} />
          Flagged Questions Queue
          {pendingCount > 0 && (
            <span style={{ backgroundColor: 'var(--status-danger)', color: '#ffffff', fontSize: '10px', padding: '1px 5px', fontWeight: 700 }}>
              {pendingCount} Pending
            </span>
          )}
        </button>

        <button
          type="button"
          className={subTab === 'logs' ? 'btn-primary btn-sm' : 'btn-sm'}
          onClick={() => setSubTab('logs')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <MessageSquare size={13} />
          All Interaction Logs ({chatLogs.length})
        </button>
      </div>

      {/* SubTab 1: Flagged Questions */}
      {subTab === 'flagged' && (
        <div>
          {flaggedQuestions.length === 0 ? (
            <div className="flat-card" style={{ textAlign: 'center', padding: '32px 16px', backgroundColor: 'var(--bg-secondary)' }}>
              <CheckCircle size={24} style={{ color: 'var(--status-running)', margin: '0 auto 8px' }} />
              <strong style={{ fontSize: 13, display: 'block' }}>No Flagged Questions in Queue</strong>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                All member inquiries have been answered within verified knowledge parameters.
              </p>
            </div>
          ) : (
            <div className="flat-table-wrapper">
              <table className="flat-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Member / Role</th>
                    <th>Stage</th>
                    <th>Flagged Question</th>
                    <th>Date / Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedQuestions.map(item => {
                    const isPending = item.status === 'Pending Review';
                    return (
                      <tr key={item.id}>
                        <td>
                          <span
                            className="flat-tag"
                            style={{
                              borderColor: isPending ? 'var(--status-danger)' : 'var(--status-running)',
                              color: isPending ? 'var(--status-danger)' : 'var(--status-running)',
                              backgroundColor: isPending ? '#fff5f5' : '#f0fdf4',
                              fontSize: 10,
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <strong>{item.userName}</strong>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>
                            {item.userRole}
                          </span>
                        </td>
                        <td>
                          {item.businessStage ? <StageBadge stage={item.businessStage} /> : '-'}
                        </td>
                        <td style={{ maxWidth: 360 }}>
                          <span style={{ fontWeight: 500 }}>"{item.question}"</span>
                          {item.adminAnswer && (
                            <p style={{ fontSize: 11, color: 'var(--accent-gold-dark)', marginTop: 4, borderLeft: '2px solid var(--accent-gold)', paddingLeft: 6 }}>
                              <strong>Admin Answer:</strong> {item.adminAnswer}
                            </p>
                          )}
                          {item.adminNotes && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                              Notes: {item.adminNotes}
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-sm"
                            onClick={() => handleOpenReview(item)}
                          >
                            {isPending ? 'Review & Answer' : 'Edit Response'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SubTab 2: All Interaction Logs */}
      {subTab === 'logs' && (
        <div className="flat-table-wrapper">
          <table className="flat-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Member</th>
                <th>Stage</th>
                <th>User Query</th>
                <th>Knowledge Assistant Response</th>
                <th>Grounded Sources</th>
                <th>Flag Status</th>
              </tr>
            </thead>
            <tbody>
              {chatLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <strong>{log.userName}</strong>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>
                      {log.userRole}
                    </span>
                  </td>
                  <td>
                    {log.businessStage ? <StageBadge stage={log.businessStage} /> : '-'}
                  </td>
                  <td style={{ maxWidth: 220, fontSize: 12 }}>
                    <strong>"{log.query}"</strong>
                  </td>
                  <td style={{ maxWidth: 340, fontSize: 12, color: 'var(--text-secondary)' }}>
                    {log.response}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: 11 }}>
                    <span className="font-mono">{log.sourcesCount}</span>
                  </td>
                  <td>
                    {log.isFlagged ? (
                      <span className="flat-tag" style={{ borderColor: 'var(--status-danger)', color: 'var(--status-danger)', fontSize: 10 }}>
                        Flagged
                      </span>
                    ) : (
                      <span className="flat-tag" style={{ borderColor: 'var(--status-running)', color: 'var(--status-running)', fontSize: 10 }}>
                        Grounded
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {reviewingFlag && (
        <div className="flat-modal-backdrop" onClick={() => setReviewingFlag(null)}>
          <div className="flat-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="flat-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} className="text-gold" />
                <strong style={{ fontSize: 14 }}>Review Flagged Inquiry</strong>
              </div>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setReviewingFlag(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="flat-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 12 }}>From: {reviewingFlag.userName} ({reviewingFlag.userRole})</strong>
                  {reviewingFlag.businessStage && <StageBadge stage={reviewingFlag.businessStage} />}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 4 }}>
                  "{reviewingFlag.question}"
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Official Administrator Guidance / Answer:
                </label>
                <textarea
                  rows={4}
                  value={adminAnswerText}
                  onChange={e => setAdminAnswerText(e.target.value)}
                  placeholder="Provide the verified answer or link to a new resource..."
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Internal Admin Notes:
                </label>
                <input
                  type="text"
                  value={adminNotesText}
                  onChange={e => setAdminNotesText(e.target.value)}
                  placeholder="e.g. Schedule new resource upload for SADC regulations..."
                />
              </div>
            </div>

            <div className="flat-modal-footer">
              <button type="button" className="btn-sm" onClick={() => setReviewingFlag(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger btn-sm"
                onClick={() => handleSaveReview('Dismissed')}
              >
                Dismiss (Out of Scope)
              </button>
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => handleSaveReview('Answered')}
              >
                Mark as Answered
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
