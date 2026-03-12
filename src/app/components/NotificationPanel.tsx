import {
  Bell,
  Check,
  Flag,
  Megaphone,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { ElementType } from "react";
import { useNotifications } from "../context/NotificationContext";

function typeMeta(type: string): {
  icon: ElementType;
  color: string;
  bg: string;
} {
  switch (type) {
    case "challenge":
      return { icon: Trophy, color: "#34d399", bg: "rgba(52,211,153,0.12)" };
    case "team":
      return { icon: Users, color: "#c084fc", bg: "rgba(192,132,252,0.12)" };
    case "ctf":
      return { icon: Flag, color: "#fbbf24", bg: "rgba(251,191,36,0.12)" };
    case "announce":
      return { icon: Megaphone, color: "#fb923c", bg: "rgba(251,146,60,0.12)" };
    default:
      return { icon: Zap, color: "#60a5fa", bg: "rgba(96,165,250,0.12)" };
  }
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markRead } = useNotifications();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.3)" }}
      />

      <div
        className="fixed z-50 flex flex-col"
        style={{
          top: "72px",
          right: "12px",
          width: "360px",
          maxHeight: "calc(100vh - 92px)",
          background: "rgba(6, 11, 21, 0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(212,165,32,0.2)",
          borderRadius: "12px",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2">
            <Bell size={15} style={{ color: "#fbbf24" }} />
            <span
              style={{
                fontFamily: "Rajdhani, sans-serif",
                fontSize: "14px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              Notifications
            </span>
            {unreadCount > 0 && (
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  background: "#fbbf24",
                  color: "#000",
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "11px",
                  fontWeight: "800",
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 5px",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 rounded"
            style={{
              color: "rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer",
            }}
          >
            <X size={12} />
          </button>
        </div>

        <div
          className="overflow-y-auto flex-1 notif-scroll"
          style={{ overscrollBehavior: "contain" }}
        >
          {notifications.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 gap-3"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <Bell size={32} style={{ opacity: 0.3 }} />
              <span
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "13px",
                  letterSpacing: "1px",
                }}
              >
                All caught up
              </span>
            </div>
          ) : (
            notifications.map((notif) => {
              const meta = typeMeta(notif.type);
              const Icon = meta.icon;
              const body =
                notif.content || (notif.html ? stripHtml(notif.html) : "");

              return (
                <div
                  key={notif.id}
                  className="flex gap-3 px-4 py-3 group transition-colors cursor-pointer"
                  style={{
                    background: notif._read
                      ? "transparent"
                      : "rgba(251,191,36,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                  onClick={() => markRead(notif.id)}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg mt-0.5"
                    style={{ background: meta.bg }}
                  >
                    <Icon size={14} style={{ color: meta.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        style={{
                          fontFamily: "Rajdhani, sans-serif",
                          fontSize: "13px",
                          fontWeight: notif._read ? "600" : "700",
                          color: notif._read
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.95)",
                          letterSpacing: "0.3px",
                          lineHeight: "1.3",
                        }}
                      >
                        {notif.title || "Notification"}
                      </span>
                      {!notif._read && (
                        <span
                          className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                          style={{ background: "#fbbf24" }}
                        />
                      )}
                    </div>

                    {body && (
                      <p
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.45)",
                          lineHeight: "1.5",
                          marginTop: "2px",
                        }}
                      >
                        {body}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-1.5">
                      <span
                        style={{
                          fontFamily: "Rajdhani, sans-serif",
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.25)",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {new Date(notif.date).toLocaleTimeString()}
                      </span>
                      {!notif._read && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markRead(notif.id);
                            }}
                            className="flex items-center justify-center w-5 h-5 rounded"
                            title="Mark read"
                            style={{
                              background: "rgba(251,191,36,0.1)",
                              color: "#fbbf24",
                              cursor: "pointer",
                            }}
                          >
                            <Check size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

function stripHtml(html: string): string {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent || d.innerText || "";
}
