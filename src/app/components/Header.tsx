import {
  Bell,
  ChevronDown,
  Flag,
  Menu,
  Star,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import type { ElementType } from "react";
import { useState } from "react";
import { Link, NavLink } from "react-router";
import logo from "../../assets/df7191d06c313a8d3147449d3377c3566c55919a.png";

interface NavItem {
  label: string;
  icon: ElementType;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Challenges", icon: Flag, href: "/challenges" },
  { label: "Scoreboard", icon: Trophy, href: "/scoreboard" },
  { label: "Teams", icon: Users, href: "/teams" },
  { label: "Profile", icon: User, href: "/profile" },
];

interface HeaderProps {
  totalPoints: number;
  solvedCount: number;
}

export function Header({ totalPoints, solvedCount }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
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
            <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img
                src={logo}
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
                1446 AH EDITION
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
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
          </nav>

          {/* Right side: Score + Notifications + Profile */}
          <div className="flex items-center gap-3">
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
              className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <Bell size={15} />
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "#fbbf24" }}
              />
            </button>

            {/* Profile */}
            <button
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all"
              style={{
                border: "1px solid rgba(192,132,252,0.2)",
                background: "rgba(192,132,252,0.06)",
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #c084fc)",
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                KH
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
                Khalid
              </span>
              <ChevronDown
                size={13}
                style={{ color: "rgba(255,255,255,0.4)" }}
              />
            </button>

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

        {/* Mobile Nav */}
        {mobileOpen && (
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
          </div>
        )}
      </div>
    </header>
  );
}
