import { useState, useEffect, useCallback } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import MemberDashboard from "./pages/MemberDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { api } from "./services/api";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const navigate = useCallback((p, pushHistory = true) => {
    setPage(p);
    if (pushHistory) {
      window.history.pushState({ page: p }, "", `#${p}`);
    }
  }, []);

  // ── Restore session on page load & handle Azure SSO redirect ──────────────
  useEffect(() => {
    let unsubscribe = () => { };

    const init = async () => {
      if (isSupabaseConfigured()) {
        // Subscribe to auth state changes (catches Azure SSO redirect callback)
        unsubscribe = api.onAuthStateChange((user) => {
          if (user) {
            setCurrentUser(user);
            const isAdmin = user.roleId === 2 || user.roleId === 3 || user.roleId === 4;
            // Only navigate if we're currently on the login page (avoid overriding active nav)
            setPage(prev => {
              if (prev === "login" || prev === "register") {
                if (isAdmin) return "admin-dashboard";
                if (user.status === "Pending") {
                  return user.businessStageId ? "pending-approval" : "profile-setup";
                }
                if (user.status === "Rejected") {
                  return "pending-approval";
                }
                return "member-dashboard";
              }
              return prev;
            });
          } else {
            setCurrentUser(null);
            setPage("login");
          }
          setSessionLoading(false);
        });

        // Also try restoring an existing session immediately
        const restoredUser = await api.getCurrentUser();
        if (restoredUser) {
          setCurrentUser(restoredUser);
          const isAdmin = restoredUser.roleId === 2 || restoredUser.roleId === 3 || restoredUser.roleId === 4;
          if (isAdmin) {
            navigate("admin-dashboard", false);
          } else if (restoredUser.status === "Pending") {
            navigate(restoredUser.businessStageId ? "pending-approval" : "profile-setup", false);
          } else if (restoredUser.status === "Rejected") {
            navigate("pending-approval", false);
          } else {
            navigate("member-dashboard", false);
          }
        }
        setSessionLoading(false);
      } else {
        // Offline / fallback mode — no session to restore
        setSessionLoading(false);
      }
    };

    init();
    return () => unsubscribe();
  }, [navigate]);

  // ── Browser Back/Forward navigation ──────────────────────────────────────
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setPage(e.state.page);
      } else if (window.location.hash) {
        const hashPage = window.location.hash.replace("#", "");
        if (["login", "register", "profile-setup", "member-dashboard", "admin-dashboard"].includes(hashPage)) {
          setPage(hashPage);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    if (!window.history.state) {
      window.history.replaceState({ page: "login" }, "", "#login");
    }
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setPendingUser(user);
    if (user.roleId === 2 || user.roleId === 3 || user.roleId === 4) {
      navigate("admin-dashboard");
    } else if (user.status === "Pending") {
      navigate(user.businessStageId ? "pending-approval" : "profile-setup");
    } else if (user.status === "Rejected") {
      navigate("pending-approval");
    } else {
      navigate("member-dashboard");
    }
  };

  const handleRegisterSuccess = (userData) => {
    setPendingUser(userData);
    setCurrentUser(userData);
    navigate("profile-setup");
  };

  const handleProfileComplete = (completedUser) => {
    setCurrentUser(completedUser);
    setPendingUser(null);
    if (completedUser.status === "Pending") {
      navigate("pending-approval");
    } else {
      navigate("member-dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      await api.signOut();
    } catch (e) {
      console.warn("Logout error:", e.message);
    }
    setCurrentUser(null);
    setPendingUser(null);
    navigate("login");
  };

  // ── Session restore loading screen ───────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className="session-loading">
        <div className="session-loading-inner">
          <div className="auth-logo-mark" style={{ margin: "0 auto 16px", fontSize: 22 }}>EW</div>
          <div className="session-spinner" />
          <p>Restoring your session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {page === "login" && (
        <Login onLogin={handleLoginSuccess} onGoRegister={() => navigate("register")} />
      )}
      {page === "register" && (
        <Register
          onRegister={handleRegisterSuccess}
          onGoLogin={() => navigate("login")}
        />
      )}
      {page === "profile-setup" && (
        <ProfileSetup
          pendingUser={pendingUser || currentUser}
          currentUser={currentUser}
          onComplete={handleProfileComplete}
          onBack={() => navigate("login")}
        />
      )}
      {page === "member-dashboard" && (
        currentUser ? (
          <MemberDashboard user={currentUser} onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLoginSuccess} onGoRegister={() => navigate("register")} />
        )
      )}
      {page === "admin-dashboard" && (
        currentUser ? (
          <AdminDashboard user={currentUser} onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLoginSuccess} onGoRegister={() => navigate("register")} />
        )
      )}
      {page === "pending-approval" && (
        currentUser ? (
        <div className="auth-page">
          <div className="auth-card" style={{ maxWidth: 500, textAlign: "center" }}>
            <div className="auth-logo" style={{ justifyContent: "center", marginBottom: 24 }}>
              <div className="auth-logo-mark">EW</div>
              <div className="auth-logo-text" style={{ textAlign: "left" }}>
                <h1>Enactus Wits</h1>
                <p>Support System</p>
              </div>
            </div>
            
            {currentUser.status === "Rejected" ? (
              <>
                <div className="status-icon-rejected" style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <h2>Account Registration Rejected</h2>
                <p className="auth-sub" style={{ marginTop: 12, fontSize: 15, lineHeight: "1.5" }}>
                  Your account registration request has been reviewed and rejected by the Enactus Wits Administration.
                </p>
                <p style={{ color: "#f43f5e", fontSize: 13, marginTop: 16, padding: 12, background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: 8 }}>
                  If you believe this was in error, please contact the Enactus Wits Executive Committee or your Faculty Advisor.
                </p>
              </>
            ) : (
              <>
                <div className="status-icon-pending" style={{ fontSize: 48, marginBottom: 16 }}>⌛</div>
                <h2>Awaiting Admin Approval</h2>
                <p className="auth-sub" style={{ marginTop: 12, fontSize: 15, lineHeight: "1.5" }}>
                  Thank you for completing your founder profile, <strong>{currentUser.fullName}</strong>!
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "16px 0", lineHeight: "1.5" }}>
                  Your account is currently <strong>Pending</strong> administrator review. 
                  Enactus Wits executives will review your business details and approve your registration soon. 
                  You will gain access to the Member Dashboard once approved.
                </p>
              </>
            )}

            <button className="btn-secondary" onClick={handleLogout} style={{ marginTop: 24, width: "100%" }}>
              Sign out & Back to Login
            </button>
          </div>
        </div>
        ) : (
          <Login onLogin={handleLoginSuccess} onGoRegister={() => navigate("register")} />
        )
      )}
    </div>
  );
}
