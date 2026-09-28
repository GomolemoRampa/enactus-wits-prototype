import React, { useState } from 'react';
import { useAuth } from '../../services/auth/authContext';
import { LogIn, ExternalLink, ShieldCheck, BookOpen, FolderArchive, AlertCircle } from 'lucide-react';

export const PublicLandingPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="app-container" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Accent Line */}
      <div style={{ height: 3, backgroundColor: 'var(--accent-gold)', width: '100%' }} />

      {/* Minimal Header */}
      <header style={{ borderBottom: '1px solid var(--border-color)', padding: '16px 24px', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="brand-badge">ENACTUS WITS</span>
            <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>Knowledge Hub</strong>
          </div>
          <a
            href={import.meta.env.VITE_MAIN_APP_URL || "http://localhost:3001"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}
          >
            Main Enactus Support System <ExternalLink size={12} />
          </a>
        </div>
      </header>

      {/* Main Hero & Auth Section */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ maxWidth: 960, width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'stretch' }}>
          
          {/* Left Column: Knowledge Hub Purpose */}
          <div className="flat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid var(--accent-gold)' }}>
            <div>
              <div className="flat-tag flat-tag-accent" style={{ marginBottom: 12 }}>
                Enactus Wits Dedicated Repository
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.2 }}>
                Enactus Wits Knowledge Hub & Learning Assistant
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                A centralized, standalone learning environment containing curated courses, business stage templates, financial models, and research guides for Enactus University of the Witwatersrand members.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 22, height: 22, border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <BookOpen size={12} className="text-gold" />
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, display: 'block' }}>Stage-Filtered Courses</strong>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Tailored curricula for Idea, Prototype, and Running Business stages.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 22, height: 22, border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <FolderArchive size={12} className="text-gold" />
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, display: 'block' }}>Resource & Template Library</strong>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Download verified questionnaires, COGS calculators, and pitch master decks.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 22, height: 22, border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <ShieldCheck size={12} className="text-gold" />
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, display: 'block' }}>Knowledge Assistant</strong>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Grounded business guidance drawing directly from verified Enactus repository materials.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)', fontSize: 11, color: 'var(--text-muted)' }}>
              Note: General member administration, project reports, and event registrations are managed on the primary Enactus Wits Support System.
            </div>
          </div>

          {/* Right Column: SSO Login Gate */}
          <div className="flat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--bg-secondary)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <ShieldCheck size={18} className="text-gold" />
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Single Sign-On Authentication</h2>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.4 }}>
                Access to the Knowledge Hub is restricted to registered Enactus Wits members and advisors. Sign in using your official Enactus account credentials.
              </p>

              {error && (
                <div style={{ color: 'var(--status-danger)', fontSize: 12, marginBottom: 12, padding: '8px', backgroundColor: 'rgba(220,53,69,0.1)', borderRadius: '4px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                {/* Email Input */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)' }}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>

                {/* Password Input */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)' }}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {/* Primary SSO Action Button */}
                <button
                  type="submit"
                  className="btn-primary btn-lg"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}
                >
                  <LogIn size={16} />
                  Login
                </button>
              </form>
            </div>

            {/* Non-Member Redirection Notice (Mandatory Requirement) */}
            <div style={{ border: '1px solid var(--border-strong)', backgroundColor: 'var(--bg-primary)', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                <AlertCircle size={15} style={{ color: 'var(--accent-gold-dark)', flexShrink: 0, marginTop: 1 }} />
                <strong style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                  Not yet an Enactus Wits Member?
                </strong>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 8 }}>
                There is no independent registration on this Knowledge Hub. You must first register as an active member on the main Enactus Wits Support System.
              </p>
              <a
                href={`${import.meta.env.VITE_MAIN_APP_URL || "http://localhost:3001"}/register`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--accent-gold-dark)',
                }}
              >
                Register on Main Enactus System <ExternalLink size={12} />
              </a>
            </div>

          </div>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '12px 24px', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        Enactus University of the Witwatersrand &bull; Knowledge Hub Standalone Platform &bull; All Rights Reserved
      </footer>
    </div>
  );
};
