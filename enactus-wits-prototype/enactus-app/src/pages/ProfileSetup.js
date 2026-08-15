import { useState } from "react";
import { BUSINESS_STAGES, api } from "../services/api";

export default function ProfileSetup({ pendingUser, onComplete }) {
  const [bio, setBio] = useState("");
  const [businessIdea, setBusinessIdea] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedStage, setSelectedStage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!bio.trim()) { setError("Please add a short bio about your entrepreneurial focus."); return; }
    if (!businessIdea.trim()) { setError("Please enter your business idea or startup name."); return; }
    if (!selectedStage) { setError("Please select your current business stage."); return; }
    setError("");
    setLoading(true);

    try {
      const updated = await api.updateProfile(pendingUser.userId, {
        bio,
        businessIdea,
        phone,
        businessStageId: selectedStage,
      });

      const completedUser = {
        ...pendingUser,
        bio,
        businessIdea,
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
          Tell us about yourself and your venture so we can tailor stage-specific opportunities, events, and resources to you.
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
          <label>Founder bio</label>
          <textarea
            rows={3}
            placeholder="Tell the Enactus team about your background, degree, and what drives your entrepreneurial journey..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            style={{ resize: "none" }}
          />
        </div>

        <div className="form-group">
          <label>Business idea / startup venture name</label>
          <input
            placeholder="e.g. EduBridge, GreenCore, FarmLink..."
            value={businessIdea}
            onChange={e => setBusinessIdea(e.target.value)}
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

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving profile..." : "Complete setup & enter dashboard →"}
        </button>
      </div>
    </div>
  );
}
