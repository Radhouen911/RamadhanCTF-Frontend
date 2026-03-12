import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type CTFdNotification,
  initialSSENotificationDebugState,
  type SSENotificationDebugState,
  useSSENotifications,
} from "../hooks/useSSENotifications";

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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface StoredNotification extends CTFdNotification {
  _seenAt: number; // timestamp for ordering
  _read: boolean;
}

interface NotificationContextType {
  notifications: StoredNotification[];
  unreadCount: number;
  debug: SSENotificationDebugState;
  markRead: (id: number) => void;
  markAllRead: () => void;
  dismiss: (id: number) => void;
  /** Latest notification for toast display (null after consumed) */
  latestToast: CTFdNotification | null;
  consumeToast: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const NotificationContext = createContext<NotificationContextType | null>(null);

const MAX_STORED = 50;

function normalizeApiNotification(raw: unknown): CTFdNotification | null {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;
  const id = obj.id;
  const numericId =
    typeof id === "number" && Number.isFinite(id)
      ? id
      : typeof id === "string" && /^[0-9]+$/.test(id)
        ? Number(id)
        : null;

  if (numericId === null) return null;

  return {
    id: numericId,
    title:
      typeof obj.title === "string" && obj.title.trim().length > 0
        ? obj.title
        : "Notification",
    content: typeof obj.content === "string" ? obj.content : "",
    html: typeof obj.html === "string" ? obj.html : "",
    type:
      typeof obj.type === "string" && obj.type.length > 0 ? obj.type : "toast",
    sound: Boolean(obj.sound),
    user: typeof obj.user === "string" ? obj.user : null,
    user_id:
      typeof obj.user_id === "number"
        ? obj.user_id
        : obj.user_id == null
          ? null
          : Number(obj.user_id),
    team: typeof obj.team === "string" ? obj.team : null,
    team_id:
      typeof obj.team_id === "number"
        ? obj.team_id
        : obj.team_id == null
          ? null
          : Number(obj.team_id),
    date:
      typeof obj.date === "string" && obj.date.length > 0
        ? obj.date
        : new Date().toISOString(),
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [latestToast, setLatestToast] = useState<CTFdNotification | null>(null);
  const [debug, setDebug] = useState<SSENotificationDebugState>(
    initialSSENotificationDebugState,
  );
  const lastSeenIdRef = useRef(0);
  const didInitialApiSyncRef = useRef(false);
  const debugEnabledRef = useRef(isNotificationDebugEnabled());

  const appendNotification = useCallback(
    (n: CTFdNotification, source: "sse" | "api", allowToast: boolean) => {
      if (debugEnabledRef.current) {
        console.info("[notifications:context] accepted notification", {
          source,
          id: n.id,
          type: n.type,
          title: n.title,
        });
      }

      setNotifications((prev) => {
        if (prev.some((p) => p.id === n.id)) return prev;
        const next: StoredNotification[] = [
          { ...n, _seenAt: Date.now(), _read: false },
          ...prev,
        ];
        return next.slice(0, MAX_STORED);
      });

      if (n.id > lastSeenIdRef.current) {
        lastSeenIdRef.current = n.id;
      }

      if (allowToast) {
        setLatestToast(n);
      }
    },
    [],
  );

  const handleNotification = useCallback(
    (n: CTFdNotification) => {
      appendNotification(n, "sse", true);
    },
    [appendNotification],
  );

  // SSE — always connected, no auth gate
  useSSENotifications(handleNotification, setDebug);

  const syncFromApi = useCallback(async () => {
    const sinceId = lastSeenIdRef.current;
    try {
      const response = await fetch(
        `/api/v1/notifications?since_id=${sinceId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        if (debugEnabledRef.current) {
          console.warn("[notifications:api] sync failed", {
            status: response.status,
            sinceId,
          });
        }
        return;
      }

      const payload = (await response.json()) as {
        data?: unknown[];
      };

      const items = Array.isArray(payload?.data) ? payload.data : [];
      if (items.length === 0) {
        return;
      }

      if (debugEnabledRef.current) {
        console.info("[notifications:api] fetched notifications", {
          count: items.length,
          sinceId,
          initialSync: !didInitialApiSyncRef.current,
        });
      }

      const normalized = items
        .map((item) => normalizeApiNotification(item))
        .filter((item): item is CTFdNotification => item !== null)
        .sort((a, b) => a.id - b.id);

      const allowToast = didInitialApiSyncRef.current;
      normalized.forEach((item) => appendNotification(item, "api", allowToast));
      didInitialApiSyncRef.current = true;
    } catch (error) {
      if (debugEnabledRef.current) {
        console.error("[notifications:api] sync exception", error);
      }
    }
  }, [appendNotification]);

  useEffect(() => {
    syncFromApi();
    const timer = setInterval(syncFromApi, 10_000);
    return () => clearInterval(timer);
  }, [syncFromApi]);

  const markRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, _read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, _read: true })));
  }, []);

  const dismiss = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const consumeToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  const unreadCount = notifications.filter((n) => !n._read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        debug,
        markRead,
        markAllRead,
        dismiss,
        latestToast,
        consumeToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
}
