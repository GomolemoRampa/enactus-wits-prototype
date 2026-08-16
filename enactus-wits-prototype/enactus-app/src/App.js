import { useState, useEffect, useCallback } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import MemberDashboard from "./pages/MemberDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);

  const navigate = useCallback((p, pushHistory = true) => {
    setPage(p);
    if (pushHistory) {
      window.history.pushState({ page: p }, "", `#${p}`);
    }
  }, []);

  // Listen for browser Back/Forward navigation
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
    // Set initial history state if not set
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

  const handleLogout = () => {
    setCurrentUser(null);
    setPendingUser(null);
    navigate("login");
  };

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

