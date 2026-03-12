import { Bell, Flag, Megaphone, Trophy, Users, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import type { CTFdNotification } from "../hooks/useSSENotifications";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const TOAST_DURATION = 6000; // ms until auto-dismiss
const MAX_TOASTS = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface ToastItem extends CTFdNotification {
  _id: number;
  _visible: boolean;
}

let _counter = 0;

function typeIcon(type: string) {
  switch (type) {
    case "challenge":
      return <Trophy size={15} />;
    case "team":
      return <Users size={15} />;
    case "ctf":
      return <Flag size={15} />;
    case "announce":
      return <Megaphone size={15} />;
    default:
      return <Bell size={15} />;
  }
}

function typeColor(type: string): {
  border: string;
  icon: string;
  bar: string;
} {
  switch (type) {
    case "challenge":
      return {
        border: "rgba(52,211,153,0.4)",
        icon: "#34d399",
        bar: "#34d399",
      };
    case "team":
      return {
        border: "rgba(192,132,252,0.4)",
        icon: "#c084fc",
        bar: "#c084fc",
      };
    case "ctf":
      return {
        border: "rgba(251,191,36,0.4)",
        icon: "#fbbf24",
        bar: "#fbbf24",
      };
    case "announce":
      return {
        border: "rgba(251,146,60,0.4)",
        icon: "#fb923c",
        bar: "#fb923c",
      };
    default:
      return {
        border: "rgba(251,191,36,0.4)",
        icon: "#fbbf24",
        bar: "#fbbf24",
      };
  }
}

// ---------------------------------------------------------------------------
// Single toast
// ---------------------------------------------------------------------------
function Toast({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const colors = typeColor(item.type);
  const title = item.title || "Notification";
  const content = item.content || (item.html ? stripHtml(item.html) : "");

  return (
    <div
      style={{
        position: "relative",
        width: "320px",
        maxWidth: "calc(100vw - 24px)",
        background: "rgba(6, 11, 21, 0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${colors.border}`,
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4)",
        transform: item._visible ? "translateX(0)" : "translateX(110%)",
        opacity: item._visible ? 1 : 0,
        transition:
          "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
      }}
    >
      {/* left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          background: colors.bar,
          borderRadius: "10px 0 0 10px",
        }}
      />

      <div
        style={{
          padding: "12px 12px 12px 18px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
        }}
      >
        {/* icon */}
        <div
          style={{
            flexShrink: 0,
            marginTop: "1px",
            color: colors.icon,
          }}
        >
          {typeIcon(item.type)}
        </div>

        {/* content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "13px",
              fontWeight: "700",
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "0.3px",
              lineHeight: "1.3",
              marginBottom: content ? "3px" : 0,
            }}
          >
            {title}
          </p>
          {content && (
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                lineHeight: "1.5",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {content}
            </p>
          )}
          <p
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "10px",
              color: "rgba(255,255,255,0.2)",
              marginTop: "4px",
              letterSpacing: "0.5px",
            }}
          >
            {new Date(item.date).toLocaleTimeString()}
          </p>
        </div>

        {/* dismiss button */}
        <button
          onClick={() => onDismiss(item._id)}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            borderRadius: "4px",
            color: "rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            cursor: "pointer",
            marginTop: "1px",
          }}
        >
          <X size={11} />
        </button>
      </div>

      {/* progress bar */}
      <div
        style={{
          height: "2px",
          background: `linear-gradient(90deg, ${colors.bar}, transparent)`,
          animation: `ctfd-toast-shrink ${TOAST_DURATION}ms linear forwards`,
          transformOrigin: "left",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider — reads latestToast from NotificationContext
// ---------------------------------------------------------------------------
export function NotificationToastProvider() {
  const { latestToast, consumeToast } = useNotifications();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t._id === id ? { ...t, _visible: false } : t)),
    );
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t._id !== id)),
      350,
    );
  }, []);

  // Watch for new toasts from context
  useEffect(() => {
    if (!latestToast) return;
    consumeToast();

    const id = ++_counter;
    const item: ToastItem = { ...latestToast, _id: id, _visible: false };

    setToasts((prev) => [...prev, item].slice(-MAX_TOASTS));

    // double-rAF to trigger CSS transition
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        setToasts((prev) =>
          prev.map((t) => (t._id === id ? { ...t, _visible: true } : t)),
        ),
      ),
    );

    const timer = setTimeout(() => dismiss(id), TOAST_DURATION);
    timers.current.set(id, timer);
  }, [latestToast, consumeToast, dismiss]);

  return (
    <>
      {/* keyframe injected once */}
      <style>{`
        @keyframes ctfd-toast-shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "16px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "flex-end",
          pointerEvents: toasts.length === 0 ? "none" : "auto",
        }}
      >
        {toasts.map((t) => (
          <Toast key={t._id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function stripHtml(html: string): string {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent || d.innerText || "";
}
