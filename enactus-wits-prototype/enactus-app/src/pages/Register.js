import { useState } from "react";
import { api, validateEmailDomain } from "../services/api";

export default function Register({ onRegister, onGoLogin }) {
  const [step, setStep] = useState("form"); // form | verify
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    studentNumber: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Domain validation
    const domainCheck = validateEmailDomain(form.email);
    if (!domainCheck.valid) {
      setError(domainCheck.error);
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const user = await api.signUp({
        fullName: form.fullName,
        email: form.email,
        studentNumber: form.studentNumber,
        password: form.password,
      });
      setCreatedUser(user);
      setStep("verify");
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyComplete = () => {
    if (createdUser) {
      onRegister(createdUser);
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

        {step === "form" && (
          <>
            <button type="button" className="btn-back-auth" onClick={onGoLogin}>
              ← Back to Sign In
            </button>
            <h2>Create your account</h2>
            <p className="auth-sub">Join the Enactus Wits student entrepreneur network</p>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full name</label>
                <input
                  placeholder="e.g. Lerato Dlamini"
                  value={form.fullName}
                  onChange={e => setField("fullName", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Wits university email</label>
                <input
                  type="email"
                  placeholder="studentnumber@students.wits.ac.za"
                  value={form.email}
                  onChange={e => setField("email", e.target.value)}
                  required
                />
                <span className="form-hint">
                  Restricted to official <strong>@students.wits.ac.za</strong> accounts
                </span>
              </div>

              <div className="form-group">
                <label>Student number</label>
                <input
                  placeholder="e.g. 2021045123"
                  value={form.studentNumber}
                  onChange={e => setField("studentNumber", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={e => setField("password", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm password</label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={e => setField("confirm", e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating account..." : "Continue to Profile Setup →"}
              </button>
            </form>

            <div className="auth-switch">
              Already have an account?{" "}
              <button type="button" onClick={onGoLogin}>Sign in</button>
            </div>
          </>
        )}

        {step === "verify" && (
          <div className="verify-box">
            <button type="button" className="btn-back-auth" onClick={() => setStep("form")} style={{ marginBottom: 12 }}>
              ← Back to edit registration details
            </button>
            <div className="verify-icon">📧</div>
            <h3>Verify your email address</h3>
            <p>
              We've registered your account for{" "}
              <span className="email-highlight">{form.email}</span>.
            </p>
            <p style={{ fontSize: 13, color: "#64748b", margin: "16px 0 24px" }}>
              In production with Supabase Auth & Resend, a confirmation link is sent to your inbox.
              Click continue to complete your business profile setup.
            </p>
            <button className="btn-primary" onClick={handleVerifyComplete}>
              Continue to Step 2: Profile Setup →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

