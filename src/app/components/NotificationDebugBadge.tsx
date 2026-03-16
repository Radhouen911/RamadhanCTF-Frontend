// File deleted
// This file contained the NotificationDebugBadge component which is now removed.
// All notification-related logic has been eliminated.
import { useMemo, useState } from "react";
import { useNotifications } from "../context/NotificationContext";

const isDev = (import.meta as any).env?.DEV === true;
const isNotificationDebugEnabled = () => {
  try {
    return (
      isDev ||
      window.localStorage.getItem("ramadhan:notifications:debug") === "1"
    );
  } catch {
    return isDev;
  }
};

function statusColor(status: string): string {
  switch (status) {
    case "open":
      return "#34d399";
    case "connecting":
      return "#fbbf24";
    case "hidden":
      return "#94a3b8";
    case "error":
      return "#f87171";
    case "closed":
      return "#a78bfa";
    default:
      return "#64748b";
  }
}

export function NotificationDebugBadge() {
  if (!isNotificationDebugEnabled()) return null;

  const [collapsed, setCollapsed] = useState(false);
  const { debug, notifications, unreadCount } = useNotifications();

  const lastSeen = useMemo(() => {
    if (!debug.lastEventAt) return "-";
    try {
      return new Date(debug.lastEventAt).toLocaleTimeString();
    } catch {
      return debug.lastEventAt;
    }
  }, [debug.lastEventAt]);

  const dotColor = statusColor(debug.status);

  return (
    <div
      style={{
        position: "fixed",
        left: "12px",
        bottom: "12px",
        zIndex: 10000,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: collapsed ? "8px 10px" : "8px 12px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(6,11,21,0.92)",
          color: "rgba(255,255,255,0.9)",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 600,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        title="Toggle notification debug panel"
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "999px",
            background: dotColor,
            boxShadow: `0 0 8px ${dotColor}`,
            flexShrink: 0,
          }}
        />
        <span>Notifications SSE</span>
        <span style={{ color: "rgba(255,255,255,0.65)" }}>{debug.status}</span>
      </button>

      {!collapsed && (
        <div
          style={{
            marginTop: "8px",
            width: "360px",
            maxWidth: "calc(100vw - 24px)",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(6,11,21,0.95)",
            color: "rgba(255,255,255,0.88)",
            padding: "10px 12px",
            fontSize: "11px",
            lineHeight: 1.45,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div>Status: {debug.status}</div>
          <div>
            Events: {debug.eventCount} | Parsed notifications:{" "}
            {debug.notificationCount}
          </div>
          <div>
            List size: {notifications.length} | Unread: {unreadCount}
          </div>
          <div>Parse errors: {debug.parseErrorCount}</div>
          <div>Error count: {debug.errorCount}</div>
          <div>Reconnect in: {debug.reconnectDelayMs} ms</div>
          <div>
            Last event: {debug.lastEventType ?? "-"} at {lastSeen}
          </div>
          {debug.lastError && <div>Last error: {debug.lastError}</div>}
          {debug.lastPayloadPreview && (
            <div style={{ marginTop: "6px", color: "rgba(255,255,255,0.65)" }}>
              Payload: {debug.lastPayloadPreview}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
