import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

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
import AllPages       from "./pages/AllPages";
import NotFoundPage   from "./pages/NotFoundPage";
import ServerErrorPage from "./pages/ServerErrorPage";

// Shared component
import Sidebar from "./components/Sidebar";

// Pages that should NOT show the sidebar
const NO_SIDEBAR = ["/", "/login", "/signup", "/all"];

// Mock user — replace with real Supabase auth user later
const mockUser = {
  name:    "Johnpaul3.0",
  level:   4,
  xp:      200,
  xpMax:   800,
  streak:  8,
  xpToday: 200,
};

function AppShell() {
  const location   = useLocation();
  const [open, setOpen] = useState(false);

  const showSidebar = !NO_SIDEBAR.includes(location.pathname);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0a0a0a" }}>

      {showSidebar && (
        <>
          <Sidebar open={open} onClose={() => setOpen(false)} user={mockUser} />
          {/* Desktop spacer so content doesn't sit behind the sidebar */}
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
          <Route path="/all"    element={<AllPages />} />

          {/* App — pass onMenuOpen so each page can open the sidebar on mobile */}
          <Route path="/dashboard"  element={<DashboardPage  onMenuOpen={() => setOpen(true)} user={mockUser} />} />
          <Route path="/tasks"      element={<MyTasksPage    onMenuOpen={() => setOpen(true)} user={mockUser} />} />
          <Route path="/categories" element={<CategoriesPage onMenuOpen={() => setOpen(true)} user={mockUser} />} />
          <Route path="/calendar"   element={<CalendarPage   onMenuOpen={() => setOpen(true)} user={mockUser} />} />
          <Route path="/account"    element={<ProfilePage    onMenuOpen={() => setOpen(true)} user={mockUser} />} />
          <Route path="/settings"   element={<SettingsPage   onMenuOpen={() => setOpen(true)} user={mockUser} />} />

          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
          {/* Error pages */}
          <Route path="/500" element={<ServerErrorPage />}/>
          <Route path="*"    element={<NotFoundPage />}/>          
        </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <AppShell />;
}