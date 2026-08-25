// src/pages/admin/Reports.jsx
//
// Enactus Wits Support System — System-Generated Reports
// Iteration 3 / Elaboration 2
//
// Embeds the published Power BI report, which contains both system-generated
// reports as separate pages:
//   Page 1 — Membership & Platform Engagement
//   Page 2 — Business Stage Progression & Milestone
//
// Viewers switch between them using the page tabs along the bottom of the embed.
// Access is restricted to Super Admin and Faculty Advisor per BR01 and BR-A21.

import React, { useState, useEffect } from "react";
import { api, getRoleName } from "../../services/api";

const POWER_BI_URL =
  "https://app.powerbi.com/reportEmbed?reportId=75038e84-07e1-4c10-9091-85d0c6b96f0d&autoAuth=true&ctid=4b1b908c-5582-4377-ba07-a36d65e34934";

// Roles permitted to view organisation-wide reports (BR01, BR-A21).
// Members and Admins are excluded: these reports aggregate the whole
// membership and identify individual students by name and student number.
const PERMITTED_ROLE_IDS = [3, 4]; // 3 = Super Admin, 4 = Faculty Advisor
const PERMITTED_ROLE_NAMES = [
  "SuperAdmin",
  "FacultyAdvisor",
  "Super Admin",
  "Faculty Advisor",
];

export default function Reports({ user: propUser }) {
  const [currentUser, setCurrentUser] = useState(propUser || null);
  const [isLoadingFrame, setIsLoadingFrame] = useState(true);

  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
    } else {
      // Fallback if not passed directly as prop
      api.getCurrentUser().then((u) => {
        if (u) setCurrentUser(u);
      });
    }
  }, [propUser]);

  const roleName =
    currentUser?.roleName ||
    (currentUser?.roleId ? getRoleName(currentUser.roleId) : null) ||
    currentUser?.role?.roleName ||
    currentUser?.role?.role_name;

  const roleId = Number(currentUser?.roleId || currentUser?.role_id);

  if (!currentUser) {
    return (
      <div className="reports-page">
        <div className="reports-message-card">
          <div className="reports-message-icon">🔒</div>
          <h3>Authentication Required</h3>
          <p>Please sign in to view system-generated analytics.</p>
        </div>
      </div>
    );
  }

  const isPermitted =
    PERMITTED_ROLE_IDS.includes(roleId) ||
    PERMITTED_ROLE_NAMES.includes(roleName);

  if (!isPermitted) {
    return (
      <div className="reports-page">
        <header className="reports-header">
          <h1>System-Generated Reports</h1>
          <p>
            Produced automatically by the system. Aggregates data from Power BI.
          </p>
        </header>
        <div className="reports-message-card warning">
          <div className="reports-message-icon">⚠️</div>
          <h3>Access Restricted</h3>
          <p>
            System-generated reports are available to <strong>Super Admins</strong> and{" "}
            <strong>Faculty Advisors</strong> only (per policy BR01 & BR-A21).
          </p>
          <div className="reports-role-badge">
            Current role: <span>{roleName || "Admin"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="reports-page">
      <header className="reports-header">
        <div className="reports-header-title">
          <h1>System-Generated Reports</h1>
          <span className="reports-pill">Power BI Embed</span>
        </div>
        <p>
          Membership &amp; Platform Engagement and Business Stage Progression &amp;
          Milestone. Produced automatically by the system — no member or
          administrator enters data for these reports. Use the tabs at the bottom
          of the report to switch between them.
        </p>
      </header>

      <div className="reports-meta-bar">
        <div className="reports-page-tags">
          <span className="badge badge-blue">📄 Page 1: Membership &amp; Platform Engagement</span>
          <span className="badge badge-gold">🚀 Page 2: Business Stage Progression &amp; Milestone</span>
        </div>
        <a
          href={POWER_BI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="reports-external-link"
          title="Open in Power BI"
        >
          Open in Power BI ↗
        </a>
      </div>

      <div className="reports-frame-wrapper">
        {isLoadingFrame && (
          <div className="reports-frame-loading">
            <div className="session-spinner" />
            <p>Loading Power BI Dashboard...</p>
          </div>
        )}
        <div className="reports-frame">
          <iframe
            title="Enactus Wits system-generated reports"
            src={POWER_BI_URL}
            width="100%"
            height="820"
            frameBorder="0"
            allowFullScreen
            onLoad={() => setIsLoadingFrame(false)}
          />
        </div>
      </div>
    </section>
  );
}
