import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Bell, LogOut, User, ChevronDown, Menu, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../../api/notifications";

export default function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: () => notificationsApi.unreadCount().then((r) => r.data),
    enabled: isAuthenticated,
    refetchInterval: 15000, // poll every 15s
  });
  const unreadCount = unreadData?.count ?? 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-600 text-white p-1.5 rounded-lg">
              <BookOpen size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">LearnHub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/courses" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Courses</Link>
            <Link to="/problems" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Coding Prep</Link>
            {isAuthenticated && (
              <Link to="/quizzes" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Quizzes</Link>
            )}
            {isAuthenticated && (
              <Link to="/classrooms" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Classrooms</Link>
            )}
            {isAuthenticated && (
              <Link to="/chat" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Chat</Link>
            )}
            {isAuthenticated && hasRole("ROLE_INSTRUCTOR") && (
              <Link to="/instructor" className="text-sm font-medium text-accent-600 hover:text-accent-500 transition-colors">Instructor Hub</Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="relative p-2 text-gray-500 hover:text-primary-600">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">{user?.fullName?.split(" ")[0]}</span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={14} /> Dashboard
                      </Link>
                      <Link to="/profile" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={14} /> Profile
                      </Link>
                      <hr className="my-1" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-1.5 px-3">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-500" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {[
              { to: "/courses", label: "Courses" },
              { to: "/problems", label: "Coding Prep" },
              ...(isAuthenticated ? [
                { to: "/quizzes", label: "Quizzes" },
                { to: "/classrooms", label: "Classrooms" },
                { to: "/dashboard", label: "Dashboard" },
              ] : []),
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                {label}
              </Link>
            ))}
            {isAuthenticated && (
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                <LogOut size={14} /> Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
