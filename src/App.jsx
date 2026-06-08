import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import LandingPage    from "./pages/LandingPage";
import LoginPage      from "./pages/LoginPage";
import SignupPage     from "./pages/SignupPage";
import DashboardPage  from "./pages/DashboardPage";
import MyTasksPage    from "./pages/MyTasksPage";
import CategoriesPage from "./pages/CategoriesPage";
import CalendarPage   from "./pages/CalendarPage";
import ProfilePage    from "./pages/ProfilePage";
import SettingsPage   from "./pages/SettingsPage";
import NotFoundPage   from "./pages/NotFoundPage";
import ServerErrorPage from "./pages/ServerErrorPage";
import FocusPage from "./pages/FocusPage";

// Shared component
import Sidebar from "./components/Sidebar";

const NO_SIDEBAR = ["/", "/login", "/signup", "/500", "/focus"];

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppShell() {
  const location = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const showSidebar = !NO_SIDEBAR.includes(location.pathname);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0a0a0a" }}>

      {showSidebar && (
        <>
          <Sidebar open={open} onClose={() => setOpen(false)} user={user} />
          <div className="hidden lg:block flex-shrink-0" style={{ width: 260 }} />
        </>
      )}

      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        <div key={location.pathname} className="animate-pageEnter flex-1 flex flex-col">
          <Routes>
            {/* Public */}
            <Route path="/"       element={<LandingPage />} />
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/500"    element={<ServerErrorPage />} />
            <Route path="/focus"  element={<FocusPage />} />
            {/* Protected */}
            <Route path="/dashboard"  element={<ProtectedRoute><DashboardPage  onMenuOpen={() => setOpen(true)} user={user} /></ProtectedRoute>} />
            <Route path="/tasks"      element={<ProtectedRoute><MyTasksPage    onMenuOpen={() => setOpen(true)} user={user} /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoriesPage onMenuOpen={() => setOpen(true)} user={user} /></ProtectedRoute>} />
            <Route path="/calendar"   element={<ProtectedRoute><CalendarPage   onMenuOpen={() => setOpen(true)} user={user} /></ProtectedRoute>} />
            <Route path="/account"    element={<ProtectedRoute><ProfilePage    onMenuOpen={() => setOpen(true)} user={user} /></ProtectedRoute>} />
            <Route path="/settings"   element={<ProtectedRoute><SettingsPage   onMenuOpen={() => setOpen(true)} user={user} /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
