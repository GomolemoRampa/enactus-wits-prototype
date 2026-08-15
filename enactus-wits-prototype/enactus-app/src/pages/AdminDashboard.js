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

function Sidebar({ user, activeTab, setActiveTab, onLogout, pendingReportsCount }) {
  const initials = (user.fullName || "A")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();

  const navItems = [
    { id: "overview", icon: "⊞", label: "Overview" },
    { id: "members", icon: "👥", label: "Members Directory" },
    { id: "announcements", icon: "📢", label: "Announcements" },
    { id: "compose", icon: "✏️", label: "Send Announcement" },
    { id: "events", icon: "📅", label: "Events Management" },
    {
      id: "reports",
      icon: "📄",
      label: "Review Reports",
      badge: pendingReportsCount > 0 ? pendingReportsCount : null,
    },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">EW</div>
        <div className="sidebar-logo-text">
          <h2>Enactus Wits</h2>
          <p>Admin & Advisor Panel</p>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-name">{user.fullName}</div>
        <div className="sidebar-user-role">{getRoleName(user.roleId)}</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Administration</div>
        {navItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}
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
// TAB 1: OVERVIEW
// ────────────────────────────────────────────────────────────
function Overview({ members, announcements, events, reports, setActiveTab }) {
  const pendingReports = reports.filter(r => r.status === "Submitted" || r.status === "Pending");
  const stageCounts = BUSINESS_STAGES.map(s => ({
    ...s,
    count: members.filter(m => Number(m.businessStageId) === Number(s.stageId)).length,
  }));

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Admin Overview</h1>
          <p>Enactus Wits Support System & Incubator Operations Hub</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary" onClick={() => setActiveTab("compose")}>
            + Send Announcement
          </button>
          <button className="btn-primary" onClick={() => setActiveTab("reports")}>
            Review Reports ({pendingReports.length})
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card" onClick={() => setActiveTab("members")} style={{ cursor: "pointer" }}>
          <div className="stat-icon">👥</div>
          <div className="stat-value">{members.length}</div>
          <div className="stat-label">Registered members</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab("reports")} style={{ cursor: "pointer" }}>
          <div className="stat-icon">📄</div>
          <div className="stat-value">{pendingReports.length}</div>
          <div className="stat-label">Reports awaiting review</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab("events")} style={{ cursor: "pointer" }}>
          <div className="stat-icon">📅</div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">Active events & workshops</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab("announcements")} style={{ cursor: "pointer" }}>
          <div className="stat-icon">📢</div>
          <div className="stat-value">{announcements.length}</div>
          <div className="stat-label">Announcements published</div>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: 24 }}>
        <div>
          <h2>Member Venture Distribution by Stage</h2>
          <p>Current student businesses categorized across incubation phases</p>
        </div>
      </div>

      <div className="stats-row" style={{ marginBottom: 28 }}>
        {stageCounts.map(s => (
          <div key={s.stageId} className="stat-card" onClick={() => setActiveTab("members")} style={{ cursor: "pointer" }}>
            <div className="stat-value" style={{ fontSize: 32 }}>{s.count}</div>
            <div className="stat-label">{s.stageName}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="grid-col">
          <div className="section-header">
            <div>
              <h2>Recent Announcements</h2>
            </div>
            <button className="btn-secondary" onClick={() => setActiveTab("announcements")}>
              View all
            </button>
          </div>
          {announcements.slice(0, 2).map(ann => (
            <div key={ann.announcementId} className="announcement-card" style={{ marginBottom: 12 }}>
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
          ))}
        </div>

        <div className="grid-col">
          <div className="section-header">
            <div>
              <h2>Reports Needing Review</h2>
            </div>
            <button className="btn-secondary" onClick={() => setActiveTab("reports")}>
              Review queue
            </button>
          </div>
          {pendingReports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <p>All submitted reports have been reviewed!</p>
            </div>
          ) : (
            pendingReports.slice(0, 2).map(r => (
              <div key={r.reportId} className="announcement-card" style={{ marginBottom: 12 }}>
                <div className="announcement-meta">
                  <span className="badge badge-amber">⏳ Pending Review</span>
                  <span className="badge badge-gray">Period: {r.reportMonth}</span>
                </div>
                <div className="announcement-title">{r.userName || "Student Member"}</div>
                <div className="announcement-body">{r.businessSummary}</div>
                <div className="announcement-date">Submitted {formatDate(r.submittedAt)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// TAB 2: MEMBERS DIRECTORY
// ────────────────────────────────────────────────────────────
function MembersTab({ members }) {
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("all");

  const filtered = members.filter(m => {
    const matchSearch =
      (m.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.businessIdea || "").toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === "all" || String(m.businessStageId) === String(filterStage);
    return matchSearch && matchStage;
  });

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Members Directory</h1>
          <p>{members.length} registered student entrepreneurs & venture founders</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          placeholder="Search by student name, email, or venture name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStage}
          onChange={e => setFilterStage(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Business Stages</option>
          {BUSINESS_STAGES.map(s => (
            <option key={s.stageId} value={s.stageId}>{s.stageName}</option>
          ))}
        </select>
      </div>

      <div className="table-card">
        <table className="member-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Wits Student Email</th>
              <th>Cell Number</th>
              <th>Business Stage</th>
              <th>Account Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>
                  No members matched your search.
                </td>
              </tr>
            ) : (
              filtered.map(m => (
                <tr key={m.userId}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="table-avatar">
                        {(m.fullName || "M").split(" ").map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{m.fullName}</span>
                    </div>
                  </td>
                  <td style={{ color: "#64748b" }}>{m.email}</td>
                  <td style={{ color: "#64748b" }}>{m.phone || "—"}</td>
                  <td>
                    <span className="badge badge-amber">{getStageName(m.businessStageId)}</span>
                  </td>
                  <td>
                    <span className={`badge ${m.status === "Active" ? "badge-green" : "badge-gray"}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// TAB 3: ANNOUNCEMENTS (UC2)
// ────────────────────────────────────────────────────────────
function AnnouncementsTab({ announcements, setActiveTab }) {
  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Published Announcements</h1>
          <p>{announcements.length} messages broadcast or targeted to members</p>
        </div>
        <button className="btn-primary" onClick={() => setActiveTab("compose")}>
          + Send Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📢</div>
          <p>No announcements created yet.</p>
        </div>
      ) : (
        announcements.map(ann => (
          <div key={ann.announcementId} className={`announcement-card ${ann.pinned ? "pinned" : ""}`}>
            <div className="announcement-meta">
              {ann.pinned && <span className="badge badge-pin">📌 Pinned</span>}
              <span className={`badge ${ann.audienceType === "AllMembers" ? "badge-blue" : "badge-amber"}`}>
                {AUDIENCE_TYPES.find(a => a.value === ann.audienceType)?.label || ann.audienceType}
              </span>
            </div>
            <div className="announcement-title">{ann.title}</div>
            <div className="announcement-body">{ann.body}</div>
            <div className="announcement-date">Published on {formatDate(ann.createdAt)}</div>
          </div>
        ))
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// TAB 4: COMPOSE ANNOUNCEMENT (UC2)
// ────────────────────────────────────────────────────────────
function ComposeTab({ user, onSent }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audienceType, setAudienceType] = useState("AllMembers");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSend = async () => {
    if (!title.trim()) { setError("Please enter an announcement title."); return; }
    if (!body.trim()) { setError("Please enter the announcement body."); return; }

    setError("");
    setSending(true);

    try {
      await api.createAnnouncement(
        {
          title,
          body,
          audienceType,
        },
        user.userId
      );

      setSuccessMsg("✅ Announcement published successfully! Member inboxes will receive notifications.");
      setTitle("");
      setBody("");
      setAudienceType("AllMembers");
      await onSent();
    } catch (err) {
      setError(err.message || "Failed to send announcement.");
    } finally {
      setSending(false);
      setTimeout(() => setSuccessMsg(""), 5000);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Send Announcement</h1>
          <p>Compose and broadcast communications or stage-targeted notifications</p>
        </div>
      </div>

      {successMsg && <div className="success-toast">{successMsg}</div>}

      <div className="compose-card">
        <h2>New Announcement</h2>
        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <label>Announcement Headline</label>
          <input
            placeholder="e.g. Masterclass on Investment Pitching — Prototype Stage"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Announcement Body</label>
          <textarea
            rows={5}
            placeholder="Write the full message details, guidelines, venue details, or deadlines..."
            value={body}
            onChange={e => setBody(e.target.value)}
            style={{ resize: "vertical" }}
          />
        </div>

        <div className="form-group">
          <label>Target Audience (audience_type)</label>
          <select
            value={audienceType}
            onChange={e => setAudienceType(e.target.value)}
            className="filter-select"
            style={{ width: "100%" }}
          >
            {AUDIENCE_TYPES.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <div className="preview-box">
          <strong>Audience Delivery: </strong>
          {AUDIENCE_TYPES.find(a => a.value === audienceType)?.label}
        </div>

        <button className="btn-primary" onClick={handleSend} disabled={sending} style={{ marginTop: 16 }}>
          {sending ? "Publishing..." : "Publish & Dispatch Announcement →"}
        </button>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// TAB 5: EVENTS MANAGEMENT (UC3)
// ────────────────────────────────────────────────────────────
function EventsManagementTab({ events, user, onRefresh }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewAttendeesEvent, setViewAttendeesEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Workshop");
  const [eventDate, setEventDate] = useState("");
  const [visibility, setVisibility] = useState("MembersOnly");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      setError("Please fill in the title and date/time.");
      return;
    }

    setError("");
    setCreating(true);

    try {
      await api.createEvent(
        {
          title,
          description,
          category,
          eventDate,
          visibility,
        },
        user.userId
      );

      setToast("🎉 New event created successfully!");
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setEventDate("");
      await onRefresh();
    } catch (err) {
      setError(err.message || "Failed to create event.");
    } finally {
      setCreating(false);
      setTimeout(() => setToast(""), 5000);
    }
  };

  const handleOpenAttendees = async (event) => {
    setViewAttendeesEvent(event);
    setLoadingAttendees(true);
    try {
      const list = await api.getEventAttendees(event.eventId);
      setAttendees(list);
    } catch (err) {
      console.error("Error loading attendees:", err);
    } finally {
      setLoadingAttendees(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Events & Workshops Management</h1>
          <p>Organize, schedule, and track registrations for Enactus Wits member sessions</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create New Event
        </button>
      </div>

      {toast && <div className="success-toast">{toast}</div>}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Event / Workshop</h2>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label>Event Title</label>
                <input
                  placeholder="e.g. Venture Valuation Masterclass"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description & Agenda</label>
                <textarea
                  rows={3}
                  placeholder="Provide an overview of the event, facilitators, and outcomes..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    placeholder="e.g. Masterclass, General Meeting, Pitching"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Visibility</label>
                <select
                  value={visibility}
                  onChange={e => setVisibility(e.target.value)}
                  className="filter-select"
                  style={{ width: "100%" }}
                >
                  <option value="MembersOnly">Members Only</option>
                  <option value="Public">Public</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? "Creating..." : "Publish Event →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Attendees Modal */}
      {viewAttendeesEvent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <div>
                <h2>Event Attendees — {viewAttendeesEvent.title}</h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
                  {attendees.length} members registered
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setViewAttendeesEvent(null)}>✕</button>
            </div>

            {loadingAttendees ? (
              <div className="loading-spinner">Loading attendees...</div>
            ) : attendees.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>No members have registered for this event yet.</p>
              </div>
            ) : (
              <table className="member-table" style={{ marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map(a => (
                    <tr key={a.registrationId}>
                      <td style={{ fontWeight: 600 }}>{a.user?.fullName || "Member"}</td>
                      <td style={{ color: "#64748b" }}>{a.user?.email || "—"}</td>
                      <td style={{ color: "#64748b", fontSize: 13 }}>{formatDate(a.registeredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>No events have been created.</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ marginTop: 16 }}>
            Create the first event
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(ev => (
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
                  <span className="badge badge-gray" style={{ marginLeft: 6 }}>
                    {ev.status}
                  </span>
                </div>
              </div>

              <h3 className="event-title">{ev.title}</h3>
              <p className="event-desc">{ev.description}</p>

              <div className="event-details">
                <div className="detail-item">
                  <span>🏷️</span> <strong>Category:</strong> {ev.category || "Workshop"}
                </div>
                <div className="detail-item">
                  <span>🕒</span> <strong>Time:</strong> {formatDate(ev.eventDate)}
                </div>
                <div className="detail-item">
                  <span>👥</span> <strong>Registrations:</strong> {ev.registeredCount} RSVPs
                </div>
              </div>

              <div className="event-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleOpenAttendees(ev)}
                  style={{ width: "100%" }}
                >
                  View Attendees ({ev.registeredCount})
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
// TAB 6: REPORTS REVIEW (UC4)
// ────────────────────────────────────────────────────────────
function ReportsReviewTab({ reports, user, onRefresh }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [status, setStatus] = useState("Reviewed");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleOpenReview = (report) => {
    setSelectedReport(report);
    setReviewNotes(report.reviewNotes || "");
    setStatus(report.status === "Pending" ? "Reviewed" : report.status);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewNotes.trim()) {
      alert("Please enter feedback comments for the student founder.");
      return;
    }

    setSubmitting(true);
    try {
      await api.reviewReport(
        selectedReport.reportId,
        { reviewNotes, status },
        user.userId
      );

      setToast("✅ Report feedback saved and submitted to member!");
      setSelectedReport(null);
      await onRefresh();
    } catch (err) {
      alert(err.message || "Failed to save review.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(""), 5000);
    }
  };

  const filteredReports = reports.filter(r => {
    if (filterStatus === "all") return true;
    return r.status === filterStatus;
  });

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Monthly Venture Reports Review</h1>
          <p>Evaluate student entrepreneur submissions (Group11 report schema) and provide feedback</p>
        </div>
      </div>

      {toast && <div className="success-toast">{toast}</div>}

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          All Reports ({reports.length})
        </button>
        <button
          className={`filter-tab ${filterStatus === "Pending" || filterStatus === "Submitted" ? "active" : ""}`}
          onClick={() => setFilterStatus("Pending")}
        >
          ⏳ Pending Review ({reports.filter(r => r.status === "Pending" || r.status === "Submitted").length})
        </button>
        <button
          className={`filter-tab ${filterStatus === "Reviewed" ? "active" : ""}`}
          onClick={() => setFilterStatus("Reviewed")}
        >
          ✓ Reviewed ({reports.filter(r => r.status === "Reviewed").length})
        </button>
        <button
          className={`filter-tab ${filterStatus === "Flagged" ? "active" : ""}`}
          onClick={() => setFilterStatus("Flagged")}
        >
          ⚠️ Flagged ({reports.filter(r => r.status === "Flagged").length})
        </button>
      </div>

      {/* Review Dialog Modal */}
      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <div>
                <h2>Review Report — {selectedReport.userName}</h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
                  Period: {selectedReport.reportMonth} &nbsp;•&nbsp; Email: {selectedReport.userEmail}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedReport(null)}>✕</button>
            </div>

            <div className="report-review-details">
              <div className="detail-row">
                <strong>Venture Summary:</strong>
                <p>{selectedReport.businessSummary}</p>
              </div>
              <div className="detail-row">
                <strong>Revenue Generated:</strong>
                <p>{formatCurrency(selectedReport.revenueThisMonth)}</p>
              </div>
              <div className="detail-row">
                <strong>Challenges Reported:</strong>
                <p>{selectedReport.challengesFaced || "None"}</p>
              </div>
              <div className="detail-row">
                <strong>Next Steps Plan:</strong>
                <p>{selectedReport.nextStepsPlan || "None"}</p>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "20px 0" }} />

            <form onSubmit={handleSaveReview}>
              <div className="form-group">
                <label>Review Status (report_status)</label>
                <div style={{ display: "flex", gap: 12 }}>
                  <label className="stage-checkbox-label">
                    <input
                      type="radio"
                      name="status"
                      value="Reviewed"
                      checked={status === "Reviewed"}
                      onChange={e => setStatus(e.target.value)}
                    />
                    <span>✓ Mark as Reviewed</span>
                  </label>
                  <label className="stage-checkbox-label">
                    <input
                      type="radio"
                      name="status"
                      value="Flagged"
                      checked={status === "Flagged"}
                      onChange={e => setStatus(e.target.value)}
                    />
                    <span>⚠️ Flag (Requires Advisor Intervention)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Advisor / Admin Comments (admin_comments)</label>
                <textarea
                  rows={4}
                  placeholder="Provide constructive feedback, suggestions for grants, mentorship connections, or showcase nominations..."
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedReport(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Review & Comments →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredReports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <p>No reports matched this filter.</p>
        </div>
      ) : (
        <div className="reports-list">
          {filteredReports.map(r => (
            <div key={r.reportId} className="report-card">
              <div className="report-header">
                <div>
                  <span className="report-founder-name">{r.userName || "Student Founder"}</span>
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
                    {r.status}
                  </span>
                  <span className="badge badge-gray" style={{ marginLeft: 6 }}>
                    Period: {r.reportMonth}
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
                  <h4>Challenges</h4>
                  <p>{r.challengesFaced || "None"}</p>
                </div>
                <div className="report-section">
                  <h4>Next Steps</h4>
                  <p>{r.nextStepsPlan || "None"}</p>
                </div>
              </div>

              {r.reviewNotes && (
                <div className="advisor-feedback-box">
                  <div className="advisor-feedback-header">
                    <strong>💬 Admin / Advisor Comments</strong>
                    {r.reviewerName && <span className="reviewer-name">by {r.reviewerName}</span>}
                  </div>
                  <p className="advisor-feedback-text">{r.reviewNotes}</p>
                </div>
              )}

              <div className="report-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Submitted {formatDate(r.submittedAt)}</span>
                <button className="btn-secondary" onClick={() => handleOpenReview(r)}>
                  {r.reviewNotes ? "Edit Comments" : "Review & Add Comments →"}
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
// MAIN ADMIN DASHBOARD CONTAINER
// ────────────────────────────────────────────────────────────
export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [members, setMembers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    try {
      const [mems, anns, evs, reps] = await Promise.all([
        api.getAllMembers(),
        api.getAllAnnouncements(),
        api.getEvents(user.userId),
        api.getAllReports(),
      ]);
      setMembers(mems);
      setAnnouncements(anns);
      setEvents(evs);
      setReports(reps);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  }, [user.userId]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const pendingReportsCount = reports.filter(r => r.status === "Submitted" || r.status === "Pending").length;

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Overview
            members={members}
            announcements={announcements}
            events={events}
            reports={reports}
            setActiveTab={setActiveTab}
          />
        );
      case "members":
        return <MembersTab members={members} />;
      case "announcements":
        return <AnnouncementsTab announcements={announcements} setActiveTab={setActiveTab} />;
      case "compose":
        return <ComposeTab user={user} onSent={loadAdminData} />;
      case "events":
        return <EventsManagementTab events={events} user={user} onRefresh={loadAdminData} />;
      case "reports":
        return <ReportsReviewTab reports={reports} user={user} onRefresh={loadAdminData} />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        pendingReportsCount={pendingReportsCount}
      />
      <div className="main-content">
        {loading ? (
          <div className="loading-spinner">Loading admin data...</div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}
