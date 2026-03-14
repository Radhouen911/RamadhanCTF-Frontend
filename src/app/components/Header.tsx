import {
  Bell,
  ChevronDown,
  Flag,
  LogOut,
  Menu,
  Shield,
  Star,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import type { ElementType } from "react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import logoImg from "../../assets/logo.png";

import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { NotificationPanel } from "./NotificationPanel";

interface NavItem {
  label: string;
  icon: ElementType;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Challenges", icon: Flag, href: "/challenges" },
  { label: "Scoreboard", icon: Trophy, href: "/scoreboard" },
  { label: "Teams", icon: Users, href: "/teams" },
];

interface HeaderProps {
  totalPoints?: number;
  solvedCount?: number;
}

export function Header({ totalPoints = 0, solvedCount = 0 }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(6, 11, 21, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(212, 165, 32, 0.2)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.5), 0 1px 0 rgba(212,165,32,0.1)",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, rgba(212,165,32,0.6), rgba(192,132,252,0.4), transparent)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              {/* Landing page logo image */}
              <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                <img
                  src={logoImg}
                  alt="Ramadan CTF Logo"
                  className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                />
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "Cinzel Decorative, serif",
                    fontSize: "15px",
                    fontWeight: "700",
                    background: "linear-gradient(135deg, #fbbf24, #c084fc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "1px",
                  }}
                >
                  RamadanCTF
                </div>
                <div
                  style={{
                    fontFamily: "Rajdhani, sans-serif",
                    fontSize: "10px",
                    letterSpacing: "3px",
                    color: "rgba(251,191,36,0.5)",
                    marginTop: "-2px",
                  }}
                >
                  1447 AH EDITION
                </div>
              </div>
            </Link>

            {/* Desktop Nav - Only show when authenticated */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.href}
                      className={({ isActive }) => `
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    `}
                      style={({ isActive }) => ({
                        fontFamily: "Rajdhani, sans-serif",
                        fontSize: "13px",
                        fontWeight: "600",
                        letterSpacing: "1.5px",
                        color: isActive ? "#fbbf24" : "rgba(255,255,255,0.6)",
                        background: isActive
                          ? "rgba(251,191,36,0.1)"
                          : "transparent",
                        border: isActive
                          ? "1px solid rgba(251,191,36,0.25)"
                          : "1px solid transparent",
                        textTransform: "uppercase",
                      })}
                    >
                      <Icon size={14} />
                      {item.label}
                    </NavLink>
                  );
                })}

                {/* Admin button - only visible to admins */}
                {user?.isAdmin && (
                  <a
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
                    style={{
                      fontFamily: "Rajdhani, sans-serif",
                      fontSize: "13px",
                      fontWeight: "600",
                      letterSpacing: "1.5px",
                      color: "rgba(192,132,252,0.9)",
                      background: "rgba(192,132,252,0.1)",
                      border: "1px solid rgba(192,132,252,0.25)",
                      textTransform: "uppercase",
                    }}
                  >
                    <Shield size={14} />
                    Admin
                  </a>
                )}
              </nav>
            )}

            {/* Right side: Auth or Score + Profile */}
            <div className="flex items-center gap-3">
              {loading ? (
                // Loading state
                <div className="w-8 h-8 rounded-lg bg-slate-700/50 animate-pulse" />
              ) : !isAuthenticated ? (
                // Not authenticated - show Login and Register buttons
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                    style={{
                      fontFamily: "Rajdhani, sans-serif",
                      fontSize: "12px",
                      fontWeight: "600",
                      letterSpacing: "1.5px",
                      color: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.05)",
                      textTransform: "uppercase",
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                    style={{
                      fontFamily: "Rajdhani, sans-serif",
                      fontSize: "12px",
                      fontWeight: "600",
                      letterSpacing: "1.5px",
                      color: "white",
                      background: "linear-gradient(135deg, #d97706, #fbbf24)",
                      textTransform: "uppercase",
                    }}
                  >
                    Register
                  </Link>
                </>
              ) : (
                // Authenticated - show Score badge and Profile
                <>
                  {/* Score badge */}
                  <div
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{
                      background: "rgba(251,191,36,0.08)",
                      border: "1px solid rgba(251,191,36,0.2)",
                    }}
                  >
                    <Star size={13} fill="#fbbf24" stroke="none" />
                    <span
                      style={{
                        fontFamily: "Rajdhani, sans-serif",
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#fbbf24",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {totalPoints.toLocaleString()} pts
                    </span>
                    <div
                      style={{
                        width: "1px",
                        height: "12px",
                        background: "rgba(251,191,36,0.3)",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "Rajdhani, sans-serif",
                        fontSize: "12px",
                        color: "rgba(251,191,36,0.7)",
                      }}
                    >
                      {solvedCount} solved
                    </span>
                  </div>

                  {/* Notification bell */}
                  <button
                    onClick={() => {
                      setNotifOpen((o) => !o);
                      setProfileOpen(false);
                    }}
                    className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
                    style={{
                      border: notifOpen
                        ? "1px solid rgba(251,191,36,0.4)"
                        : "1px solid rgba(255,255,255,0.08)",
                      background: notifOpen
                        ? "rgba(251,191,36,0.1)"
                        : "rgba(255,255,255,0.04)",
                      color: notifOpen ? "#fbbf24" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    <Bell size={15} />
                    {unreadCount > 0 && (
                      <span
                        className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                        style={{ background: "#fbbf24" }}
                      />
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all"
                      style={{
                        border: "1px solid rgba(192,132,252,0.2)",
                        background: "rgba(192,132,252,0.06)",
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #7c3aed, #c084fc)",
                          fontFamily: "Rajdhani, sans-serif",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "white",
                        }}
                      >
                        {user?.name?.slice(0, 2).toUpperCase() || "U"}
                      </div>
                      <span
                        className="hidden sm:block"
                        style={{
                          fontFamily: "Rajdhani, sans-serif",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "rgba(255,255,255,0.8)",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {user?.name || "User"}
                      </span>
                      <ChevronDown
                        size={13}
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileOpen && (
                      <div
                        className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl border overflow-hidden"
                        style={{
                          background: "rgba(6, 11, 21, 0.95)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(212,165,32,0.15)",
                          zIndex: 1000,
                        }}
                      >
                        <div className="p-3 border-b border-white/10">
                          <p
                            style={{
                              fontFamily: "Rajdhani, sans-serif",
                              fontSize: "12px",
                              color: "rgba(255,255,255,0.7)",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            {user?.email}
                          </p>
                        </div>
                        <Link
                          to="/team"
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/5 transition-colors"
                          style={{
                            fontFamily: "Rajdhani, sans-serif",
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.8)",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                          onClick={() => setProfileOpen(false)}
                        >
                          <Users size={14} />
                          Team
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/5 transition-colors"
                          style={{
                            fontFamily: "Rajdhani, sans-serif",
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.8)",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                          onClick={() => setProfileOpen(false)}
                        >
                          <User size={14} />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-red-400 border-t border-white/10"
                          style={{
                            fontFamily: "Rajdhani, sans-serif",
                            fontSize: "13px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          <LogOut size={14} />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                }}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>

          {/* Mobile Nav - Only show when authenticated */}
          {mobileOpen && isAuthenticated && (
            <div
              className="md:hidden py-3 border-t"
              style={{ borderColor: "rgba(212,165,32,0.15)" }}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-3 rounded-lg mb-1
                  `}
                    style={({ isActive }) => ({
                      fontFamily: "Rajdhani, sans-serif",
                      fontSize: "14px",
                      fontWeight: "600",
                      letterSpacing: "1px",
                      color: isActive ? "#fbbf24" : "rgba(255,255,255,0.65)",
                      background: isActive
                        ? "rgba(251,191,36,0.08)"
                        : "transparent",
                      textTransform: "uppercase",
                    })}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}

              {/* Admin button - only visible to admins */}
              {user?.isAdmin && (
                <a
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg mb-1"
                  style={{
                    fontFamily: "Rajdhani, sans-serif",
                    fontSize: "14px",
                    fontWeight: "600",
                    letterSpacing: "1px",
                    color: "rgba(192,132,252,0.9)",
                    background: "rgba(192,132,252,0.08)",
                    textTransform: "uppercase",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  <Shield size={16} />
                  Admin
                </a>
              )}
            </div>
          )}
        </div>
      </header>
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
