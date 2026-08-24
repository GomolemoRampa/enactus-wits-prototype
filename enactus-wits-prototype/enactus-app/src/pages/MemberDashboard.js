import { useState, useEffect, useCallback } from "react";
import {
  api,
  getRoleName,
  getStageName,
  BUSINESS_STAGES,
  AUDIENCE_TYPES,
  REPORT_TEMPLATES,
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
  const [reportType, setReportType] = useState("Roadmap Monthly Report");
  const [reportMonth, setReportMonth] = useState("2026-04");
  const [businessSummary, setBusinessSummary] = useState("");
  const [revenueThisMonth, setRevenueThisMonth] = useState("");
  const [challengesFaced, setChallengesFaced] = useState("");
  const [nextStepsPlan, setNextStepsPlan] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const handleFileChange = (file) => {
    if (!file) return;
    const validExtensions = [".xlsx", ".xls", ".csv", ".pdf", ".docx", ".doc"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      setError("Please upload an Excel spreadsheet (.xlsx, .xls, .csv) or document (.pdf).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("File size exceeds 15MB limit. Please upload a smaller file.");
      return;
    }

    setError("");
    setAttachedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
    });

    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClearReportForm = () => {
    setReportType("Roadmap Monthly Report");
    setBusinessSummary("");
    setRevenueThisMonth("");
    setChallengesFaced("");
    setNextStepsPlan("");
    setAttachedFile(null);
    setFileData(null);
    setError("");
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!attachedFile && !businessSummary.trim()) {
      setError("Please either attach your completed Excel report spreadsheet or provide a summary.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await api.submitReport(
        {
          reportType,
          reportMonth,
          businessSummary: businessSummary.trim() || (attachedFile ? `Submitted via Excel spreadsheet (${attachedFile.name})` : "Monthly Venture Report"),
          revenueThisMonth: parseFloat(revenueThisMonth) || 0,
          challengesFaced: challengesFaced.trim(),
          nextStepsPlan: nextStepsPlan.trim(),
          fileName: attachedFile ? attachedFile.name : null,
          fileSize: attachedFile ? attachedFile.size : null,
          fileData: fileData || null,
        },
        user.userId
      );

      setToast("🎉 Monthly report & spreadsheet submitted successfully!");
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
          <p>Download official Excel templates, fill them out, and submit completed spreadsheets for review</p>
        </div>
        <button className="btn-primary" onClick={() => setShowSubmitModal(true)}>
          + Submit Report / Spreadsheet
        </button>
      </div>

      {toast && <div className="success-toast">{toast}</div>}

      {/* ── Official Downloadable Templates Section ── */}
      <div className="templates-download-section">
        <div className="templates-header">
          <div>
            <h2 className="templates-section-title">📊 Official Enactus Excel Report Templates</h2>
            <p className="templates-section-subtitle">
              Download the required Excel workbook template for your reporting cycle, fill it in, and submit it below.
            </p>
          </div>
        </div>

        <div className="templates-grid">
          {REPORT_TEMPLATES.map((tmpl) => (
            <div key={tmpl.id} className="template-card">
              <div className="template-card-top">
                <div className="template-icon-wrapper">
                  <span className="template-icon">📑</span>
                </div>
                <span className={`badge ${tmpl.badgeColor}`}>{tmpl.badge}</span>
              </div>
              
              <h3 className="template-title">{tmpl.title}</h3>
              <p className="template-desc">{tmpl.description}</p>
              
              <div className="template-footer">
                <span className="template-filesize">💾 {tmpl.fileSize} • .xlsx</span>
                <a
                  href={tmpl.fileUrl}
                  download={tmpl.fileName}
                  className="btn-download-template"
                  title={`Download ${tmpl.fileName}`}
                >
                  <span>📥 Download Template</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Submission Modal ── */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div>
                <h2>Submit Monthly Venture Report</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                  Upload your completed Excel report sheet or add brief venture highlights
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowSubmitModal(false)}>✕</button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmitReport}>
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label>Report Type / Category</label>
                  <select
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                    required
                  >
                    <option value="Roadmap Monthly Report">Enactus Roadmap Monthly Report</option>
                    <option value="Financial Report">Financial Report / Statements</option>
                    <option value="Marketing & Social Media Report">Marketing & Social Media Report</option>
                    <option value="Overall Venture Progress">General / Combined Venture Report</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Reporting Period</label>
                  <input
                    type="month"
                    value={reportMonth}
                    onChange={e => setReportMonth(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* ── Excel File Upload Dropzone ── */}
              <div className="form-group">
                <label>Upload Completed Excel Spreadsheet (.xlsx, .xls, .csv)</label>
                <div
                  className={`file-dropzone ${dragActive ? "drag-active" : ""} ${attachedFile ? "has-file" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("report-file-input").click()}
                >
                  <input
                    id="report-file-input"
                    type="file"
                    accept=".xlsx, .xls, .csv, .pdf"
                    style={{ display: "none" }}
                    onChange={e => handleFileChange(e.target.files[0])}
                  />

                  {attachedFile ? (
                    <div className="file-preview-card" onClick={e => e.stopPropagation()}>
                      <div className="file-preview-icon">📊</div>
                      <div className="file-preview-info">
                        <div className="file-preview-name">{attachedFile.name}</div>
                        <div className="file-preview-size">{attachedFile.size} • Ready for submission</div>
                      </div>
                      <button
                        type="button"
                        className="btn-remove-file"
                        onClick={() => {
                          setAttachedFile(null);
                          setFileData(null);
                        }}
                        title="Remove attached file"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <div className="dropzone-prompt">
                      <div className="dropzone-icon">📁</div>
                      <div className="dropzone-title">
                        <strong>Click to browse</strong> or drag & drop your Excel file here
                      </div>
                      <div className="dropzone-hint">Supports .xlsx, .xls, .csv, .pdf (Max 15MB)</div>
                    </div>
                  )}
                </div>
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
                <label>Venture Summary & Highlights (Optional if detailed in Excel)</label>
                <textarea
                  rows={2}
                  placeholder="Key milestones achieved, customers acquired, product updates, or key takeaways..."
                  value={businessSummary}
                  onChange={e => setBusinessSummary(e.target.value)}
                />
              </div>

              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label>Challenges / Obstacles (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Any bottlenecks or support needed..."
                    value={challengesFaced}
                    onChange={e => setChallengesFaced(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Next Month Action Plan (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Key priorities for next month..."
                    value={nextStepsPlan}
                    onChange={e => setNextStepsPlan(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
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

      {/* ── Reports History List ── */}
      <div className="section-title-bar" style={{ marginTop: 28, marginBottom: 14 }}>
        <h2>My Submitted Reports History</h2>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No reports submitted yet</h3>
          <p>Download a template above, fill it out, and submit your first monthly report for review and advisor feedback.</p>
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
                  <span className="badge badge-purple" style={{ marginLeft: 8 }}>
                    {r.reportType || "Roadmap Progress"}
                  </span>
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

              {/* Download Attached File Button if available */}
              {r.fileName && (
                <div className="attached-file-pill">
                  <div className="attached-file-info">
                    <span className="attached-file-icon">📊</span>
                    <div>
                      <div className="attached-file-title">Submitted Spreadsheet: <strong>{r.fileName}</strong></div>
                      {r.fileSize && <div className="attached-file-meta">{r.fileSize}</div>}
                    </div>
                  </div>
                  {r.fileData ? (
                    <a
                      href={r.fileData}
                      download={r.fileName}
                      className="btn-download-attachment"
                    >
                      📥 Download Sheet
                    </a>
                  ) : (
                    <span className="file-stored-badge">📄 File on Record</span>
                  )}
                </div>
              )}

              {r.businessSummary && (
                <div className="report-section">
                  <h4>Venture Summary / Notes</h4>
                  <p>{r.businessSummary}</p>
                </div>
              )}

              {(r.challengesFaced || r.nextStepsPlan) && (
                <div className="report-grid">
                  {r.challengesFaced && (
                    <div className="report-section">
                      <h4>Challenges Faced</h4>
                      <p>{r.challengesFaced}</p>
                    </div>
                  )}
                  {r.nextStepsPlan && (
                    <div className="report-section">
                      <h4>Next Steps Plan</h4>
                      <p>{r.nextStepsPlan}</p>
                    </div>
                  )}
                </div>
              )}

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

