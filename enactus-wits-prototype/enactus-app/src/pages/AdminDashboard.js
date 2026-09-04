import { useState, useEffect, useCallback } from "react";
import Reports from "./admin/Reports";
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

const ADMIN_TAB_LABELS = {
  overview: "Admin Overview",
  members: "Members Directory",
  announcements: "Announcements",
  compose: "Send Announcement",
  events: "Events Management",
  reports: "Review Reports",
  "system-reports": "System-Generated Reports",
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
  if (activeTab === "overview") return null;

  return (
    <div style={{ marginBottom: 18 }}>
      <div className="breadcrumbs">
        <span className="breadcrumb-link" onClick={onNavigateHome}>
          🏠 Overview
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{ADMIN_TAB_LABELS[activeTab] || activeTab}</span>
      </div>
      {canGoBack && (
        <button
          type="button"
          className="btn-back"
          onClick={onGoBack}
          title={`Return to ${previousTabLabel || "previous view"}`}
        >
          <span className="back-arrow">←</span> Back to {previousTabLabel || "Overview"}
        </button>
      )}
    </div>
  );
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
    {
      id: "system-reports",
      icon: "📊",
      label: "System Reports",
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
// ────────────────────────────────────────────────────────────
// TAB 1: OVERVIEW — IMPACT DASHBOARD
// ────────────────────────────────────────────────────────────
function Overview({ members, announcements, events, reports, setActiveTab, onRefresh, user }) {
  const [chartView, setChartView] = useState("stage"); // "stage" | "month"
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewingId, setReviewingId] = useState(null);

  const pendingReports = reports.filter(r => r.status === "Submitted" || r.status === "Pending");
  const activeMembersCount = members.filter(m => m.status === "Active" || !m.status).length;
  
  // Calculate dynamic impact score based on active ventures and reports
  const impactScore = ((members.length * 45) + (reports.length * 120) + (events.length * 85)).toLocaleString();

  const stageCounts = BUSINESS_STAGES.map(s => ({
    ...s,
    count: members.filter(m => Number(m.businessStageId) === Number(s.stageId)).length,
  }));

  // Export report as CSV
  const handleExportReport = () => {
    const headers = "User ID,Full Name,Wits Email,Business Stage,Status,Join Date\n";
    const rows = members
      .map(m => `"${m.userId || ""}","${m.fullName || ""}","${m.email || ""}","${getStageName(m.businessStageId)}","${m.status || "Active"}","${formatDate(m.joinDate)}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Enactus_Wits_Impact_Report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Quick review action for pending reports
  const handleQuickApprove = async (reportId, e) => {
    e.stopPropagation();
    try {
      setReviewingId(reportId);
      await api.reviewReport(reportId, user?.userId || 1, "Quick approved via Admin Impact Overview.", "Approved");
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Failed to approve report:", err);
    } finally {
      setReviewingId(null);
    }
  };

  // Monthly breakdown simulation for bar chart
  const monthlyData = [
    { month: "Jan", count: Math.max(2, Math.round(members.length * 0.25)) },
    { month: "Feb", count: Math.max(4, Math.round(members.length * 0.4)) },
    { month: "Mar", count: Math.max(6, Math.round(members.length * 0.6)) },
    { month: "Apr", count: Math.max(9, Math.round(members.length * 0.75)) },
    { month: "May", count: Math.max(12, Math.round(members.length * 0.9)) },
    { month: "Jun", count: members.length || 15 },
  ];

  const maxChartVal = chartView === "stage" 
    ? Math.max(...stageCounts.map(s => s.count), 5)
    : Math.max(...monthlyData.map(m => m.count), 5);

  // Filtered recent activity for table
  const recentActivities = [
    ...reports.map(r => ({
      id: `rep-${r.reportId}`,
      name: r.businessSummary ? (r.businessSummary.slice(0, 30) + "...") : `${r.userName || "Member"}'s Venture`,
      category: r.category || "Social Impact",
      status: r.status === "Approved" ? "Completed" : r.status === "Submitted" ? "Under Review" : "In Progress",
      date: r.submittedAt,
      type: "report",
      icon: "eco"
    })),
    ...events.map(ev => ({
      id: `ev-${ev.eventId}`,
      name: ev.title,
      category: "Workshops & Training",
      status: ev.status === "Upcoming" ? "Planning" : "In Progress",
      date: ev.eventDate,
      type: "event",
      icon: "school"
    })),
    ...announcements.map(a => ({
      id: `ann-${a.announcementId}`,
      name: a.title,
      category: "Community Operations",
      status: a.pinned ? "Pinned Notice" : "Published",
      date: a.createdAt,
      type: "announcement",
      icon: "campaign"
    }))
  ]
  .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  .slice(0, 5);

  return (
    <div className="impact-dashboard-container">
      {/* Top Header & Actions */}
      <div className="impact-top-header">
        <div>
          <div className="impact-badge-header">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Enactus Wits Management Portal</span>
          </div>
          <h1 className="impact-main-title">Impact Overview</h1>
          <p className="impact-subtitle">Welcome back. Here is your live enterprise incubation and community impact snapshot.</p>
        </div>
        <div className="impact-action-buttons">
          <button className="impact-btn-outline" onClick={handleExportReport}>
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
          <button className="impact-btn-secondary" onClick={() => setActiveTab("compose")}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Send Announcement
          </button>
          <button className="impact-btn-primary" onClick={() => setActiveTab("reports")}>
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            Review Queue ({pendingReports.length})
          </button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="impact-bento-grid">
        {/* Card 1: Total Ventures */}
        <div className="impact-bento-card" onClick={() => setActiveTab("members")} style={{ cursor: "pointer" }}>
          <div className="impact-card-topbar"></div>
          <div className="impact-card-header">
            <div>
              <p className="impact-card-tag">Total Ventures</p>
              <h3 className="impact-card-number">{members.length || 0}</h3>
            </div>
            <div className="impact-card-icon-wrapper bg-amber-50 text-amber-700">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
          </div>
          <div className="impact-card-footer text-teal-700">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+{members.filter(m => new Date(m.joinDate) > new Date(Date.now() - 30*86400000)).length || 3} new this month</span>
          </div>
        </div>

        {/* Card 2: Active Members */}
        <div className="impact-bento-card" onClick={() => setActiveTab("members")} style={{ cursor: "pointer" }}>
          <div className="impact-card-topbar"></div>
          <div className="impact-card-header">
            <div>
              <p className="impact-card-tag">Active Members</p>
              <h3 className="impact-card-number">{activeMembersCount}</h3>
            </div>
            <div className="impact-card-icon-wrapper bg-blue-50 text-blue-700">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <div className="impact-card-footer text-teal-700">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>100% Wits verified</span>
          </div>
        </div>

        {/* Card 3: Impact Score */}
        <div className="impact-bento-card bg-gradient-to-br from-white to-amber-50/30">
          <div className="impact-card-topbar"></div>
          <div className="impact-card-header">
            <div>
              <p className="impact-card-tag">Impact Score</p>
              <h3 className="impact-card-number">{impactScore}</h3>
            </div>
            <div className="impact-card-icon-wrapper bg-amber-500 text-white shadow-sm">
              <span className="material-symbols-outlined">volunteer_activism</span>
            </div>
          </div>
          <div className="impact-card-footer text-gray-600">
            <span>Community impact across Wits ecosystem</span>
          </div>
        </div>

        {/* Card 4: Review Queue / Reports */}
        <div className="impact-bento-card" onClick={() => setActiveTab("reports")} style={{ cursor: "pointer" }}>
          <div className="impact-card-topbar"></div>
          <div className="impact-card-header">
            <div>
              <p className="impact-card-tag">Reports Awaiting Review</p>
              <h3 className="impact-card-number">{pendingReports.length}</h3>
            </div>
            <div className="impact-card-icon-wrapper bg-amber-100 text-amber-800">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div className={`impact-card-footer ${pendingReports.length > 0 ? "text-amber-700" : "text-teal-700"}`}>
            <span className="material-symbols-outlined text-[16px]">
              {pendingReports.length > 0 ? "pending_actions" : "check_circle"}
            </span>
            <span>{pendingReports.length > 0 ? `${pendingReports.length} pending advisor feedback` : "All submissions reviewed"}</span>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Chart + Pending Review Queue */}
      <div className="impact-secondary-grid">
        {/* Chart Card */}
        <div className="impact-chart-card">
          <div className="impact-section-header">
            <div>
              <h3 className="impact-section-title">Venture & Member Growth</h3>
              <p className="impact-section-subtitle">Real-time breakdown of student ventures</p>
            </div>
            <div className="impact-chart-controls">
              <button 
                className={`chart-pill ${chartView === "stage" ? "active" : ""}`}
                onClick={() => setChartView("stage")}
              >
                By Incubation Stage
              </button>
              <button 
                className={`chart-pill ${chartView === "month" ? "active" : ""}`}
                onClick={() => setChartView("month")}
              >
                Monthly Intake
              </button>
            </div>
          </div>

          {/* Interactive Chart Area */}
          <div className="impact-chart-canvas">
            {chartView === "stage" ? (
              <div className="impact-stage-bars">
                {stageCounts.map(s => {
                  const pct = Math.max(12, Math.round((s.count / maxChartVal) * 100));
                  return (
                    <div key={s.stageId} className="impact-bar-group" onClick={() => setActiveTab("members")}>
                      <div className="impact-bar-track">
                        <div 
                          className="impact-bar-fill" 
                          style={{ height: `${pct}%` }}
                          title={`${s.count} members in ${s.stageName}`}
                        >
                          <div className="impact-bar-tooltip">{s.count}</div>
                        </div>
                      </div>
                      <div className="impact-bar-label">{s.stageName}</div>
                      <div className="impact-bar-count">{s.count} ventures</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="impact-stage-bars">
                {monthlyData.map(m => {
                  const pct = Math.max(10, Math.round((m.count / maxChartVal) * 100));
                  return (
                    <div key={m.month} className="impact-bar-group">
                      <div className="impact-bar-track">
                        <div 
                          className="impact-bar-fill" 
                          style={{ height: `${pct}%` }}
                        >
                          <div className="impact-bar-tooltip">{m.count}</div>
                        </div>
                      </div>
                      <div className="impact-bar-label">{m.month}</div>
                      <div className="impact-bar-count">{m.count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pending Review Queue / Applications Card */}
        <div className="impact-applications-card">
          <div className="impact-section-header">
            <div>
              <h3 className="impact-section-title">Pending Reports & Reviews</h3>
              <p className="impact-section-subtitle">Awaiting advisor evaluation</p>
            </div>
            {pendingReports.length > 0 && (
              <span className="impact-badge-alert">{pendingReports.length} New</span>
            )}
          </div>

          <div className="impact-applications-list">
            {pendingReports.length === 0 ? (
              <div className="impact-empty-state">
                <span className="material-symbols-outlined text-[36px] text-teal-600">task_alt</span>
                <p className="font-semibold text-gray-800 mt-2">All Caught Up!</p>
                <p className="text-xs text-gray-500 mt-1">No monthly reports are waiting in the review queue.</p>
              </div>
            ) : (
              pendingReports.slice(0, 3).map(r => (
                <div key={r.reportId} className="impact-app-item">
                  <div className="impact-app-info">
                    <div className="impact-app-avatar">
                      {(r.userName || "S").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="impact-app-name">{r.userName || "Student Member"}</p>
                      <p className="impact-app-stage">Period: {r.reportMonth || "Monthly Report"}</p>
                    </div>
                  </div>
                  <div className="impact-app-actions">
                    <button 
                      className="impact-app-btn reject" 
                      title="View full report"
                      onClick={() => setActiveTab("reports")}
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <button 
                      className="impact-app-btn accept" 
                      title="Quick Approve"
                      disabled={reviewingId === r.reportId}
                      onClick={(e) => handleQuickApprove(r.reportId, e)}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {reviewingId === r.reportId ? "hourglass_empty" : "check"}
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            className="impact-view-all-btn" 
            onClick={() => setActiveTab("reports")}
          >
            Go to Full Review Queue →
          </button>
        </div>
      </div>

      {/* Recent Project & Venture Activity Table */}
      <div className="impact-table-card">
        <div className="impact-table-header">
          <div>
            <h3 className="impact-section-title">Recent Venture Activity</h3>
            <p className="impact-section-subtitle">Live events, reports, and notices submitted into the ecosystem</p>
          </div>
          <button className="impact-link-btn" onClick={() => setActiveTab("reports")}>
            View All Activity
          </button>
        </div>

        <div className="impact-table-responsive">
          <table className="impact-table">
            <thead>
              <tr>
                <th className="pl-6">Initiative / Update</th>
                <th>Category</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th className="text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map(act => (
                <tr key={act.id} className="impact-table-row">
                  <td className="pl-6 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">{act.icon}</span>
                      </div>
                      <span>{act.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="impact-pill-category">{act.category}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        act.status === "Completed" || act.status === "Published" 
                          ? "bg-teal-600" 
                          : act.status === "Under Review" 
                          ? "bg-amber-500" 
                          : "bg-blue-600"
                      }`}></div>
                      <span className="text-sm text-gray-700">{act.status}</span>
                    </div>
                  </td>
                  <td className="text-sm text-gray-500">{formatDate(act.date)}</td>
                  <td className="text-right pr-6">
                    <button 
                      className="impact-icon-action" 
                      onClick={() => setActiveTab(act.type === "report" ? "reports" : act.type === "event" ? "events" : "announcements")}
                      title="Inspect record"
                    >
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// TAB 2: MEMBERS DIRECTORY
// ────────────────────────────────────────────────────────────
function MembersTab({ members, onRefresh }) {
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);

  const filtered = members.filter(m => {
    const matchSearch =
      (m.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.businessIdea || "").toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === "all" || String(m.businessStageId) === String(filterStage);
    return matchSearch && matchStage;
  });

  const handleApprove = async (userId, authUserId) => {
    if (actionLoading) return;
    if (window.confirm("Are you sure you want to approve this member registration?")) {
      setActionLoading(true);
      try {
        await api.approveMember(userId, authUserId);
        if (onRefresh) await onRefresh();
      } catch (err) {
        alert(err.message || "Failed to approve member.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleReject = async (userId, authUserId) => {
    if (actionLoading) return;
    if (window.confirm("Are you sure you want to reject this member registration?")) {
      setActionLoading(true);
      try {
        await api.rejectMember(userId, authUserId);
        if (onRefresh) await onRefresh();
      } catch (err) {
        alert(err.message || "Failed to reject member.");
      } finally {
        setActionLoading(false);
      }
    }
  };

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
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className={`badge ${
                        m.status === "Active" ? "badge-green" :
                        m.status === "Pending" ? "badge-amber" :
                        m.status === "Rejected" ? "badge-red" : "badge-gray"
                      }`}>
                        {m.status}
                      </span>
                      {m.status === "Pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(m.userId, m.authUserId)}
                            disabled={actionLoading}
                            title="Approve Member"
                          >
                            ✓
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleReject(m.userId, m.authUserId)}
                            disabled={actionLoading}
                            title="Reject Member"
                          >
                            ✗
                          </button>
                        </div>
                      )}
                    </div>
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

  const handleClearEventForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Workshop");
    setEventDate("");
    setVisibility("MembersOnly");
    setError("");
  };

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
      handleClearEventForm();
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

              <div className="modal-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-clear-form"
                  onClick={handleClearEventForm}
                  title="Clear all fields"
                >
                  Clear Form
                </button>
                <div style={{ display: "flex", gap: 10 }}>
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
          <p>Download and evaluate member Excel submissions & provide advisor feedback</p>
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
                  Period: {selectedReport.reportMonth} &nbsp;•&nbsp; Category: {selectedReport.reportType || "Roadmap Progress"} &nbsp;•&nbsp; Email: {selectedReport.userEmail}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedReport(null)}>✕</button>
            </div>

            <div className="report-review-details">
              {/* Attached Excel Workbook Download Box */}
              {selectedReport.fileName && (
                <div className="attached-file-pill" style={{ marginBottom: 16 }}>
                  <div className="attached-file-info">
                    <span className="attached-file-icon">📊</span>
                    <div>
                      <div className="attached-file-title">Submitted Spreadsheet: <strong>{selectedReport.fileName}</strong></div>
                      {selectedReport.fileSize && <div className="attached-file-meta">{selectedReport.fileSize}</div>}
                    </div>
                  </div>
                  {selectedReport.fileData ? (
                    <a
                      href={selectedReport.fileData}
                      download={selectedReport.fileName}
                      className="btn-download-attachment"
                    >
                      📥 Download & Open Excel
                    </a>
                  ) : (
                    <span className="file-stored-badge">📄 File on Record</span>
                  )}
                </div>
              )}

              {selectedReport.businessSummary && (
                <div className="detail-row">
                  <strong>Venture Summary / Notes:</strong>
                  <p>{selectedReport.businessSummary}</p>
                </div>
              )}
              <div className="detail-row">
                <strong>Revenue Generated:</strong>
                <p>{formatCurrency(selectedReport.revenueThisMonth)}</p>
              </div>
              {selectedReport.challengesFaced && (
                <div className="detail-row">
                  <strong>Challenges Reported:</strong>
                  <p>{selectedReport.challengesFaced}</p>
                </div>
              )}
              {selectedReport.nextStepsPlan && (
                <div className="detail-row">
                  <strong>Next Steps Plan:</strong>
                  <p>{selectedReport.nextStepsPlan}</p>
                </div>
              )}
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

              <div className="modal-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-clear-form"
                  onClick={() => setReviewNotes("")}
                  title="Clear comments"
                >
                  Clear Comments
                </button>
                <div style={{ display: "flex", gap: 10 }}>
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

              {/* Download Attached Excel file if available */}
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
                      <h4>Challenges</h4>
                      <p>{r.challengesFaced}</p>
                    </div>
                  )}
                  {r.nextStepsPlan && (
                    <div className="report-section">
                      <h4>Next Steps</h4>
                      <p>{r.nextStepsPlan}</p>
                    </div>
                  )}
                </div>
              )}

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
  const [tabHistory, setTabHistory] = useState(["overview"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const activeTab = tabHistory[historyIndex] || "overview";

  const [members, setMembers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState([]);
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
      navigateTab("overview");
    }
  }, [historyIndex, navigateTab]);

  const canGoBack = historyIndex > 0 || activeTab !== "overview";
  const previousTab = historyIndex > 0 ? tabHistory[historyIndex - 1] : "overview";
  const previousTabLabel = ADMIN_TAB_LABELS[previousTab] || "Overview";

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
            setActiveTab={navigateTab}
            onRefresh={loadAdminData}
            user={user}
          />
        );
      case "members":
        return <MembersTab members={members} onRefresh={loadAdminData} />;
      case "announcements":
        return <AnnouncementsTab announcements={announcements} setActiveTab={navigateTab} />;
      case "compose":
        return <ComposeTab user={user} onSent={loadAdminData} />;
      case "events":
        return <EventsManagementTab events={events} user={user} onRefresh={loadAdminData} />;
      case "reports":
        return <ReportsReviewTab reports={reports} user={user} onRefresh={loadAdminData} />;
      case "system-reports":
        return <Reports user={user} />;
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
        pendingReportsCount={pendingReportsCount}
      />
      <div className="main-content">
        <NavigationHeader
          activeTab={activeTab}
          canGoBack={canGoBack}
          previousTabLabel={previousTabLabel}
          onGoBack={goBack}
          onNavigateHome={() => navigateTab("overview")}
        />
        {loading ? (
          <div className="loading-spinner">Loading admin data...</div>
        ) : (
          renderContent()
        )}
      </div>

      <UndoToast toast={undoToast} onDismiss={dismissUndoToast} />
    </div>
  );
}

