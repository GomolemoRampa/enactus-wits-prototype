import { useState, useEffect, useCallback } from "react";
import {
  api,
  getRoleName,
  getStageName,
  BUSINESS_STAGES,
  AUDIENCE_TYPES,
} from "../services/api";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

const TAB_LABELS = {
  dashboard: "Dashboard",
  announcements: "Announcements",
  events: "Events & Workshops",
  reports: "Monthly Reports",
  milestones: "Milestones",
  profile: "My Profile",
};

function UndoToast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div className="undo-toast-container">
      <div className={`undo-toast ${toast.type || "success"}`}>
        <div className="undo-toast-body">
          <div className="undo-toast-message">{toast.message}</div>
          <div className="undo-toast-actions">
            {toast.onUndo && (
              <button
                type="button"
                className="btn-undo"
                onClick={() => {
                  toast.onUndo();
                  onDismiss();
                }}
              >
                ↩ Undo
              </button>
            )}
            <button
              type="button"
              className="btn-toast-close"
              onClick={onDismiss}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
        <div
          className="toast-progress"
          style={{ animationDuration: `${(toast.duration || 5000) / 1000}s` }}
        />
      </div>
    </div>
  );
}

function NavigationHeader({ activeTab, canGoBack, previousTabLabel, onGoBack, onNavigateHome }) {
  if (activeTab === "dashboard") return null;

  return (
    <div style={{ marginBottom: 18 }}>
      <div className="breadcrumbs">
        <span className="breadcrumb-link" onClick={onNavigateHome}>
          🏠 Home
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{TAB_LABELS[activeTab] || activeTab}</span>
      </div>
      {canGoBack && (
        <button
          type="button"
          className="btn-back"
          onClick={onGoBack}
          title={`Return to ${previousTabLabel || "previous page"}`}
        >
          <span className="back-arrow">←</span> Back to {previousTabLabel || "Dashboard"}
        </button>
      )}
    </div>
  );
}

function Sidebar({ user, activeTab, setActiveTab, onLogout }) {
  const initials = (user.fullName || "M")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();
  const stageName = getStageName(user.businessStageId);

  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "announcements", icon: "📢", label: "Announcements" },
    { id: "events", icon: "📅", label: "Events & Workshops" },
    { id: "reports", icon: "📄", label: "Monthly Reports" },
    { id: "milestones", icon: "🏆", label: "Milestones" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">EW</div>
        <div className="sidebar-logo-text">
          <h2>Enactus Wits</h2>
          <p>Member Portal</p>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-name">{user.fullName}</div>
        <div className="sidebar-user-role">{getRoleName(user.roleId)}</div>
        {user.businessStageId && (
          <div className="sidebar-stage-badge">{stageName}</div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div className="nav-section-label">Account</div>
        <div
          className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <span className="nav-icon">👤</span>
          My Profile
        </div>
      </nav>

      <div className="sidebar-logout">
        <button className="logout-btn" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// TAB 1: DASHBOARD HOME
// ────────────────────────────────────────────────────────────
function DashboardHome({ user, setActiveTab, announcements, reports, events }) {
  const stageName = getStageName(user.businessStageId);
  const registeredEvents = events.filter(e => e.isRegistered);
  const pendingReports = reports.filter(r => r.status === "Submitted" || r.status === "Pending");

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Welcome back, {user.fullName.split(" ")[0]} 👋</h1>
          <p>Enactus Wits Support System & Venture Acceleration Portal</p>
        </div>
        <button className="btn-primary" onClick={() => setActiveTab("reports")}>
          + Submit Monthly Report
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card" onClick={() => setActiveTab("announcements")} style={{ cursor: "pointer" }}>
          <div className="stat-icon">📢</div>
          <div className="stat-value">{announcements.length}</div>
          <div className="stat-label">Announcements for you</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab("events")} style={{ cursor: "pointer" }}>
          <div className="stat-icon">📅</div>
          <div className="stat-value">{registeredEvents.length}</div>
          <div className="stat-label">Upcoming RSVP'd events</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab("reports")} style={{ cursor: "pointer" }}>
          <div className="stat-icon">📄</div>
          <div className="stat-value">{reports.length}</div>
          <div className="stat-label">Reports submitted ({pendingReports.length} in review)</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab("profile")} style={{ cursor: "pointer" }}>
          <div className="stat-icon">🚀</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{stageName.replace(" Stage", "")}</div>
          <div className="stat-label">Your business stage</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="grid-col">
          <div className="section-header">
            <div>
              <h2>Latest announcements</h2>
              <p>Tailored to your current stage and university updates</p>
            </div>
            <button className="btn-secondary" onClick={() => setActiveTab("announcements")}>
              View all
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No new announcements at this time.</p>
            </div>
          ) : (
            announcements.slice(0, 3).map(ann => (
              <AnnouncementCard key={ann.announcementId} ann={ann} />
            ))
          )}
        </div>

        <div className="grid-col">
          <div className="section-header">
            <div>
              <h2>Upcoming workshops & events</h2>
              <p>Expand your skills & connect with mentors</p>
            </div>
            <button className="btn-secondary" onClick={() => setActiveTab("events")}>
              Browse all
            </button>
          </div>

          {events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p>No upcoming events posted.</p>
            </div>
          ) : (
            events.slice(0, 2).map(ev => (
              <div key={ev.eventId} className="announcement-card" style={{ marginBottom: 12 }}>
                <div className="announcement-meta">
                  <span className="badge badge-blue">
                    {ev.visibility === "Public" ? "Public" : "Members Only"}
                  </span>
                  {ev.isRegistered ? (
                    <span className="badge badge-green">✓ You are registered</span>
                  ) : (
                    <span className="badge badge-gray">{ev.registeredCount} RSVPs</span>
                  )}
                </div>
                <div className="announcement-title">{ev.title}</div>
                <div style={{ fontSize: 13, color: "#64748b", margin: "6px 0" }}>
                  📍 {ev.location} &nbsp;•&nbsp; 🕒 {formatDate(ev.eventDate)}
                </div>
                <div className="announcement-body">{ev.description}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// TAB 2: ANNOUNCEMENTS (UC2)
// ────────────────────────────────────────────────────────────
function AnnouncementCard({ ann }) {
  return (
    <div className={`announcement-card ${ann.pinned ? "pinned" : ""}`}>
      <div className="announcement-meta">
        {ann.pinned && <span className="badge badge-pin">📌 Pinned</span>}
        <span className={`badge ${ann.audienceType === "AllMembers" ? "badge-blue" : "badge-amber"}`}>
          {AUDIENCE_TYPES.find(a => a.value === ann.audienceType)?.label || ann.audienceType}
        </span>
      </div>
      <div className="announcement-title">{ann.title}</div>
      <div className="announcement-body">{ann.body}</div>
      <div className="announcement-date">Posted {formatDate(ann.createdAt)}</div>
    </div>
  );
}

function AnnouncementsTab({ announcements }) {
  const [filter, setFilter] = useState("all");

  const filtered = announcements.filter(a => {
    if (filter === "pinned") return a.pinned;
    if (filter === "stage") return a.audienceType !== "AllMembers";
    return true;
  });

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Announcements</h1>
          <p>{announcements.length} updates and notifications for your venture</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({announcements.length})
        </button>
        <button
          className={`filter-tab ${filter === "pinned" ? "active" : ""}`}
          onClick={() => setFilter("pinned")}
        >
          📌 Pinned
        </button>
        <button
          className={`filter-tab ${filter === "stage" ? "active" : ""}`}
          onClick={() => setFilter("stage")}
        >
          🎯 Stage Targeted
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No announcements match this filter.</p>
        </div>
      ) : (
        filtered.map(ann => <AnnouncementCard key={ann.announcementId} ann={ann} />)
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// TAB 3: EVENTS MANAGEMENT & RSVP (UC3)
// ────────────────────────────────────────────────────────────
function EventsTab({ events, user, onRefresh, triggerUndoToast }) {
  const [filter, setFilter] = useState("all");
  const [loadingId, setLoadingId] = useState(null);

  const handleRSVP = async (event) => {
    setLoadingId(event.eventId);
    const wasRegistered = event.isRegistered;
    try {
      if (wasRegistered) {
        await api.cancelEventRegistration(event.eventId, user.userId);
        if (triggerUndoToast) {
          triggerUndoToast({
            message: `Cancelled RSVP for "${event.title}".`,
            type: "info",
            onUndo: async () => {
              await api.registerForEvent(event.eventId, user.userId);
              await onRefresh();
            },
          });
        }
      } else {
        await api.registerForEvent(event.eventId, user.userId);
        if (triggerUndoToast) {
          triggerUndoToast({
            message: `🎉 Success! You are registered for "${event.title}".`,
            type: "success",
            onUndo: async () => {
              await api.cancelEventRegistration(event.eventId, user.userId);
              await onRefresh();
            },
          });
        }
      }
      await onRefresh();
    } catch (err) {
      alert(err.message || "Failed to update registration.");
    } finally {
      setLoadingId(null);
    }
  };

  const displayedEvents = events.filter(e => {
    if (filter === "registered") return e.isRegistered;
    return true;
  });

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Events & Workshops</h1>
          <p>Participate in masterclasses, showcases, and networking sessions</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Upcoming Events ({events.length})
        </button>
        <button
          className={`filter-tab ${filter === "registered" ? "active" : ""}`}
          onClick={() => setFilter("registered")}
        >
          My RSVPs ({events.filter(e => e.isRegistered).length})
        </button>
      </div>

      {displayedEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>{filter === "registered" ? "You haven't RSVP'd to any events yet." : "No events scheduled."}</p>
        </div>
      ) : (
        <div className="events-grid">
          {displayedEvents.map(ev => (
            <div key={ev.eventId} className="event-card">
              <div className="event-header">
                <div className="event-date-badge">
                  <div className="date-month">
                    {new Date(ev.eventDate).toLocaleDateString("en-ZA", { month: "short" }).toUpperCase()}
                  </div>
                  <div className="date-day">{new Date(ev.eventDate).getDate()}</div>
                </div>
                <div>
                  <span className="badge badge-blue">
                    {ev.visibility === "Public" ? "Public" : "Members Only"}
                  </span>
                  {ev.isRegistered && (
                    <span className="badge badge-green" style={{ marginLeft: 6 }}>
                      ✓ Registered
                    </span>
                  )}
                </div>
              </div>

              <h3 className="event-title">{ev.title}</h3>
              <p className="event-desc">{ev.description}</p>

              <div className="event-details">
                <div className="detail-item">
                  <span>🏷️</span> <strong>Category:</strong> {ev.category || "Workshop"}
                </div>
                <div className="detail-item">
                  <span>🕒</span> <strong>Date & Time:</strong> {formatDate(ev.eventDate)}
                </div>
                <div className="detail-item">
                  <span>👥</span> <strong>Total Registrations:</strong> {ev.registeredCount} members
                </div>
              </div>

              <div className="event-actions">
                <button
                  className={`btn-rsvp ${ev.isRegistered ? "registered" : "available"}`}
                  onClick={() => handleRSVP(ev)}
                  disabled={loadingId === ev.eventId}
                >
                  {loadingId === ev.eventId
                    ? "Updating..."
                    : ev.isRegistered
                      ? "Cancel RSVP"
                      : "RSVP / Register →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// TAB 4: MONTHLY REPORTS (UC4)
// ────────────────────────────────────────────────────────────
function ReportsTab({ reports, user, onRefresh }) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [reportMonth, setReportMonth] = useState("2026-04");
  const [businessSummary, setBusinessSummary] = useState("");
  const [revenueThisMonth, setRevenueThisMonth] = useState("");
  const [challengesFaced, setChallengesFaced] = useState("");
  const [nextStepsPlan, setNextStepsPlan] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const handleClearReportForm = () => {
    setBusinessSummary("");
    setRevenueThisMonth("");
    setChallengesFaced("");
    setNextStepsPlan("");
    setError("");
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!businessSummary.trim()) { setError("Please provide a business progress summary."); return; }
    if (!challengesFaced.trim()) { setError("Please detail any challenges or obstacles faced."); return; }
    if (!nextStepsPlan.trim()) { setError("Please outline your next month's action plan."); return; }

    setError("");
    setSubmitting(true);

    try {
      await api.submitReport(
        {
          reportMonth,
          businessSummary,
          revenueThisMonth: parseFloat(revenueThisMonth) || 0,
          challengesFaced,
          nextStepsPlan,
        },
        user.userId
      );

      setToast("🎉 Monthly business report submitted successfully!");
      setShowSubmitModal(false);
      handleClearReportForm();
      await onRefresh();
    } catch (err) {
      setError(err.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(""), 5000);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>My Monthly Reports</h1>
          <p>Submit and track monthly venture reports for Enactus advisors & showcase evaluations</p>
        </div>
        <button className="btn-primary" onClick={() => setShowSubmitModal(true)}>
          + Submit New Report
        </button>
      </div>

      {toast && <div className="success-toast">{toast}</div>}

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Submit Monthly Business Report</h2>
              <button className="modal-close-btn" onClick={() => setShowSubmitModal(false)}>✕</button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmitReport}>
              <div className="form-group">
                <label>Submission Period (e.g. 2026-04)</label>
                <input
                  type="month"
                  value={reportMonth}
                  onChange={e => setReportMonth(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Venture Progress & Key Activities</label>
                <textarea
                  rows={3}
                  placeholder="Summarize key milestones achieved, customers acquired, product updates, or partnerships signed..."
                  value={businessSummary}
                  onChange={e => setBusinessSummary(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Revenue Generated This Month (ZAR)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={revenueThisMonth}
                  onChange={e => setRevenueThisMonth(e.target.value)}
                />
                <span className="form-hint">Enter 0 if currently pre-revenue or in validation phase.</span>
              </div>

              <div className="form-group">
                <label>Challenges & Obstacles Faced</label>
                <textarea
                  rows={3}
                  placeholder="What difficulties arose? (e.g. supplier delays, regulatory compliance, technical bottlenecks, marketing conversion)..."
                  value={challengesFaced}
                  onChange={e => setChallengesFaced(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Next Month Action Plan & Priorities</label>
                <textarea
                  rows={3}
                  placeholder="What are your key goals and support needs for next month?..."
                  value={nextStepsPlan}
                  onChange={e => setNextStepsPlan(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-clear-form"
                  onClick={handleClearReportForm}
                  title="Clear all fields"
                >
                  Clear Form
                </button>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowSubmitModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Report →"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No reports submitted yet</h3>
          <p>Submit your first monthly report so advisors can provide feedback and track your venture's trajectory.</p>
          <button className="btn-primary" onClick={() => setShowSubmitModal(true)} style={{ marginTop: 16 }}>
            Submit your first report
          </button>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map(r => (
            <div key={r.reportId} className="report-card">
              <div className="report-header">
                <div>
                  <span className="report-month-tag">📅 Period: {r.reportMonth}</span>
                  <span
                    className={`badge ${
                      r.status === "Reviewed"
                        ? "badge-green"
                        : r.status === "Flagged"
                          ? "badge-amber"
                          : "badge-blue"
                    }`}
                    style={{ marginLeft: 8 }}
                  >
                    {r.status === "Reviewed" ? "✓ Reviewed" : r.status === "Flagged" ? "⚠️ Flagged" : "⏳ Pending Review"}
                  </span>
                </div>
                <div className="report-revenue-tag">
                  Revenue: <strong>{formatCurrency(r.revenueThisMonth)}</strong>
                </div>
              </div>

              <div className="report-section">
                <h4>Venture Summary</h4>
                <p>{r.businessSummary}</p>
              </div>

              <div className="report-grid">
                <div className="report-section">
                  <h4>Challenges Faced</h4>
                  <p>{r.challengesFaced || "None reported."}</p>
                </div>
                <div className="report-section">
                  <h4>Next Steps Plan</h4>
                  <p>{r.nextStepsPlan || "None specified."}</p>
                </div>
              </div>

              {r.reviewNotes && (
                <div className="advisor-feedback-box">
                  <div className="advisor-feedback-header">
                    <strong>💬 Advisor / Admin Comments</strong>
                    {r.reviewerName && <span className="reviewer-name">by {r.reviewerName}</span>}
                  </div>
                  <p className="advisor-feedback-text">{r.reviewNotes}</p>
                </div>
              )}

              <div className="report-footer">
                <span>Submitted on {formatDate(r.submittedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// TAB 5: MILESTONES
// ────────────────────────────────────────────────────────────
function MilestonesTab({ milestones }) {
  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Venture Milestones</h1>
          <p>Key achievements logged during your Enactus incubation</p>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <p>No milestones recorded yet. Keep building!</p>
        </div>
      ) : (
        <div className="milestones-timeline">
          {milestones.map(m => (
            <div key={m.milestoneId} className="milestone-item">
              <div className="milestone-dot" />
              <div className="milestone-card">
                <div className="announcement-meta">
                  {m.flaggedForShowcase && (
                    <span className="badge badge-green">⭐ Flagged for Nationals Showcase</span>
                  )}
                  <span className="badge badge-gray">{m.source || "MemberLogged"}</span>
                  <span className="badge badge-gray">{formatDate(m.achievedAt)}</span>
                </div>
                <div className="announcement-title">{m.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// TAB 6: PROFILE
// ────────────────────────────────────────────────────────────
function ProfileTab({ user }) {
  const stageName = getStageName(user.businessStageId);
  const stage = BUSINESS_STAGES.find(s => s.business_stage_id === user.businessStageId);
  const initials = (user.fullName || "M")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>My Profile</h1>
          <p>Your official Enactus Wits student entrepreneur credentials</p>
        </div>
      </div>

      <div className="announcement-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div className="profile-avatar-large">{initials}</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#0a2342" }}>{user.fullName}</div>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>{user.email}</div>
            <div style={{ marginTop: 8 }}>
              <span className="badge badge-blue">{getRoleName(user.roleId)}</span>
              {stageName && <span className="badge badge-amber" style={{ marginLeft: 6 }}>{stageName}</span>}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { label: "Wits Email", value: user.email },
            { label: "Cell number", value: user.phone || "Not provided" },
            { label: "Account status", value: user.status || "Active" },
            { label: "Business stage", value: stageName },
          ].map(({ label, value }) => (
            <div key={label} className="profile-field-box">
              <div className="field-label">{label}</div>
              <div className="field-value">{value}</div>
            </div>
          ))}
        </div>

        {stage && (
          <div className="stage-highlight-box">
            <div className="stage-tag">Current Business Stage</div>
            <div className="stage-name">{stage.stageName}</div>
            <div className="stage-desc">{stage.stageDescription}</div>
          </div>
        )}
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// MAIN CONTAINER
// ────────────────────────────────────────────────────────────
export default function MemberDashboard({ user, onLogout }) {
  const [tabHistory, setTabHistory] = useState(["dashboard"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const activeTab = tabHistory[historyIndex] || "dashboard";

  const [announcements, setAnnouncements] = useState([]);
  const [reports, setReports] = useState([]);
  const [events, setEvents] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Undo Toast state
  const [undoToast, setUndoToast] = useState(null);
  const [toastTimer, setToastTimer] = useState(null);

  const triggerUndoToast = useCallback((toastData) => {
    setUndoToast(toastData);
    if (toastTimer) clearTimeout(toastTimer);
    const timer = setTimeout(() => {
      setUndoToast(null);
    }, toastData.duration || 5000);
    setToastTimer(timer);
  }, [toastTimer]);

  const dismissUndoToast = useCallback(() => {
    if (toastTimer) clearTimeout(toastTimer);
    setUndoToast(null);
  }, [toastTimer]);

  const navigateTab = useCallback((newTab) => {
    if (newTab === activeTab) return;
    setTabHistory(prev => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(newTab);
      return next;
    });
    setHistoryIndex(prev => prev + 1);
  }, [activeTab, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    } else {
      navigateTab("dashboard");
    }
  }, [historyIndex, navigateTab]);

  const canGoBack = historyIndex > 0 || activeTab !== "dashboard";
  const previousTab = historyIndex > 0 ? tabHistory[historyIndex - 1] : "dashboard";
  const previousTabLabel = TAB_LABELS[previousTab] || "Dashboard";

  const loadData = useCallback(async () => {
    try {
      const [annData, repData, evData, msData] = await Promise.all([
        api.getAnnouncementsForUser(user.userId, user.businessStageId),
        api.getMyReports(user.userId),
        api.getEvents(user.userId),
        api.getMilestonesForUser(user.userId),
      ]);
      setAnnouncements(annData);
      setReports(repData);
      setEvents(evData);
      setMilestones(msData);
    } catch (err) {
      console.error("Error loading member data:", err);
    } finally {
      setLoading(false);
    }
  }, [user.userId, user.businessStageId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardHome
            user={user}
            setActiveTab={navigateTab}
            announcements={announcements}
            reports={reports}
            events={events}
            milestones={milestones}
          />
        );
      case "announcements":
        return <AnnouncementsTab announcements={announcements} />;
      case "events":
        return (
          <EventsTab
            events={events}
            user={user}
            onRefresh={loadData}
            triggerUndoToast={triggerUndoToast}
          />
        );
      case "reports":
        return <ReportsTab reports={reports} user={user} onRefresh={loadData} />;
      case "milestones":
        return <MilestonesTab milestones={milestones} />;
      case "profile":
        return <ProfileTab user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={navigateTab}
        onLogout={onLogout}
      />
      <div className="main-content">
        <NavigationHeader
          activeTab={activeTab}
          canGoBack={canGoBack}
          previousTabLabel={previousTabLabel}
          onGoBack={goBack}
          onNavigateHome={() => navigateTab("dashboard")}
        />
        {loading ? (
          <div className="loading-spinner">Loading dashboard data...</div>
        ) : (
          renderContent()
        )}
      </div>

      <UndoToast toast={undoToast} onDismiss={dismissUndoToast} />
    </div>
  );
}

