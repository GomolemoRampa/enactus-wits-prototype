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
                return isAdmin ? "admin-dashboard" : "member-dashboard";
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
          navigate(isAdmin ? "admin-dashboard" : "member-dashboard", false);
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
    if (user.roleId === 2 || user.roleId === 3 || user.roleId === 4) {
      navigate("admin-dashboard");
    } else {
      navigate("member-dashboard");
    }
  };

  const handleRegisterSuccess = (userData) => {
    setPendingUser(userData);
    navigate("profile-setup");
  };

  const handleProfileComplete = (completedUser) => {
    setCurrentUser(completedUser);
    navigate("member-dashboard");
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
          pendingUser={pendingUser}
          onComplete={handleProfileComplete}
          onBack={() => navigate("login")}
        />
      )}
      {page === "member-dashboard" && currentUser && (
        <MemberDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {page === "admin-dashboard" && currentUser && (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}
