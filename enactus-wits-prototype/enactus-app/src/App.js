import { useState } from "react";
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

  const navigate = (p) => setPage(p);

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
        <Register onRegister={handleRegisterSuccess} onGoLogin={() => navigate("login")} />
      )}
      {page === "profile-setup" && (
        <ProfileSetup pendingUser={pendingUser} onComplete={handleProfileComplete} />
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
