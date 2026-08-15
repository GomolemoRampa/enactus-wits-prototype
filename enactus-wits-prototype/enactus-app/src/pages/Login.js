import { useState } from "react";
import { api, validateEmailDomain } from "../services/api";

export default function Login({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await api.signIn(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleAzureLogin = async () => {
    setError("");
    try {
      await api.signInWithAzure();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">EW</div>
          <div className="auth-logo-text">
            <h1>Enactus Wits</h1>
            <p>Support System</p>
          </div>
        </div>
        <h2>Welcome back</h2>
        <p className="auth-sub">Sign in to access your member or admin dashboard</p>

        {error && <div className="error-msg">{error}</div>}

        {/* Microsoft Entra ID (Wits Student SSO) Button */}
        <button
          type="button"
          className="btn-azure-sso"
          onClick={handleAzureLogin}
          title="Sign in with your official Wits Student Account"
        >
          <svg className="azure-icon" viewBox="0 0 23 23" width="18" height="18">
            <path fill="#f35325" d="M1 1h10v10H1z"/>
            <path fill="#81bc06" d="M12 1h10v10H12z"/>
            <path fill="#05a6f0" d="M1 12h10v10H1z"/>
            <path fill="#ffba08" d="M12 12h10v10H12z"/>
          </svg>
          Sign in with Wits Entra ID (SSO)
        </button>

        <div className="auth-divider">
          <span>or sign in with password</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>University email</label>
            <input
              type="email"
              placeholder="e.g. 2021045@students.wits.ac.za"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <span className="form-hint">Must be @students.wits.ac.za or staff domain</span>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?{" "}
          <button type="button" onClick={onGoRegister}>Create one</button>
        </div>

        <div className="demo-accounts-box">
          <div className="demo-header">
            <strong>Demo test accounts:</strong>
          </div>
          <div className="demo-list">
            <div><span className="demo-badge member">Member</span> <code>lerato@students.wits.ac.za</code> / <code>password123</code></div>
            <div><span className="demo-badge admin">Admin</span> <code>admin@students.wits.ac.za</code> / <code>admin123</code></div>
            <div><span className="demo-badge advisor">Advisor</span> <code>p.naidoo@students.wits.ac.za</code> / <code>advisor123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
