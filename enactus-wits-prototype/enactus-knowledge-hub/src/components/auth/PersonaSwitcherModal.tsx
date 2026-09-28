import React from 'react';
import { useAuth } from '../../services/auth/authContext';
import { StageBadge } from '../common/StageBadge';
import { X, Check, Shield, User, GraduationCap } from 'lucide-react';

interface PersonaSwitcherModalProps {
  onClose: () => void;
}

export const PersonaSwitcherModal: React.FC<PersonaSwitcherModalProps> = ({ onClose }) => {
  const { user, personas, switchPersona } = useAuth();

  const handleSelect = async (personaId: string) => {
    await switchPersona(personaId);
    onClose();
  };

  return (
    <div className="flat-modal-backdrop" onClick={onClose}>
      <div className="flat-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="flat-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} className="text-gold" />
            <strong style={{ fontSize: 14 }}>Switch Enactus SSO Account</strong>
          </div>
          <button type="button" className="btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="flat-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Select an Enactus member, administrator, or faculty advisor persona to test role-based access and automatic business stage filtering.
          </p>

          {personas.map(p => {
            const isSelected = user?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelect(p.id)}
                style={{
                  border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--accent-gold-light)' : 'var(--bg-primary)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{p.name}</strong>
                    {isSelected && (
                      <span className="flat-tag flat-tag-accent" style={{ fontSize: 10 }}>
                        Active
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {p.role} {p.teamRole ? `• ${p.teamRole}` : ''}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {p.email} • ID: {p.enactusId}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p.businessStageId && <StageBadge stage={p.businessStageId} />}
                  {p.role === 'Faculty Advisor' && (
                    <span className="flat-tag" style={{ fontSize: 10 }}>
                      Read-Only
                    </span>
                  )}
                  {isSelected ? (
                    <Check size={16} className="text-gold" />
                  ) : (
                    <button type="button" className="btn-sm">
                      Select
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flat-modal-footer">
          <button type="button" className="btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
