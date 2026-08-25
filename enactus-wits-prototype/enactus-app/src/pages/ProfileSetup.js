import { useState } from "react";
import { BUSINESS_STAGES, api } from "../services/api";

export default function ProfileSetup({ pendingUser, currentUser, onComplete, onBack }) {
  const [phone, setPhone] = useState("");
  const [selectedStage, setSelectedStage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const activeUser = pendingUser || currentUser;

  const handleReset = () => {
    setPhone("");
    setSelectedStage(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!activeUser) {
      setError("Active session not found. Please sign in or register again.");
      return;
    }
    if (!selectedStage) {
      setError("Please select your current business stage.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const updated = await api.updateProfile(
        activeUser.userId ?? null,
        activeUser.authUserId ?? null,
        {
          phone,
          businessStageId: selectedStage,
        }
      );

      const completedUser = {
        ...activeUser,
        phone,
        businessStageId: selectedStage,
        ...(updated || {}),
      };

      onComplete(completedUser);
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page">
      <div className="setup-card">
        {onBack && (
          <button type="button" className="btn-back-auth" onClick={onBack}>
            ← Back to Sign In
          </button>
        )}

        <div className="auth-logo" style={{ marginBottom: 24 }}>
          <div className="auth-logo-mark">EW</div>
          <div className="auth-logo-text">
            <h1>Enactus Wits</h1>
            <p>Support System</p>
          </div>
        </div>

        <div className="setup-step">Step 2 of 2 — Venture Profile Setup</div>
        <h2>Complete your founder profile</h2>
        <p className="setup-sub">
          Tell us about your venture stage so we can tailor stage-specific opportunities, events, and resources to you.
        </p>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <label>Phone number <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
          <input
            type="tel"
            placeholder="e.g. 071 234 5678"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Select your business development stage</label>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12, marginTop: 2 }}>
            This determines which stage-targeted announcements, masterclasses, and funding alerts you receive.
          </p>
          <div className="stage-cards">
            {BUSINESS_STAGES.map(stage => (
              <div
                key={stage.stageId}
                className={`stage-card ${selectedStage === stage.stageId ? "selected" : ""}`}
                onClick={() => setSelectedStage(stage.stageId)}
              >
                <div className="stage-card-header">
                  <div className="stage-card-name">{stage.stageName}</div>
                  {selectedStage === stage.stageId && <span className="stage-selected-dot">✓</span>}
                </div>
                <div className="stage-card-desc">{stage.stageDescription}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
          <button
            type="button"
            className="btn-clear-form"
            onClick={handleReset}
            title="Reset form fields"
          >
            Clear Form
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? "Saving profile..." : "Complete setup & enter dashboard →"}
          </button>
        </div>
      </div>
    </div>
  );
}
