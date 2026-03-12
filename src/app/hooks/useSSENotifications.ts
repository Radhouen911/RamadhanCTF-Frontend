import { useCallback, useEffect, useRef } from "react";

// Debug logs are off by default in production; enable with:
// localStorage.setItem("ramadhan:notifications:debug", "1")
const isDev = (import.meta as any).env?.DEV === true;
const isNotificationDebugEnabled = () => {
  try {
    return (
      isDev || window.localStorage.getItem("ramadhan:notifications:debug") === "1"
    );
  } catch {
    return isDev;
  }
};

// Shape CTFd sends over /events
export interface CTFdNotification {
  id: number;
  title: string;
  content: string;
  html: string;
  type: string; // "toast" | "challenge" | "team" | etc.
  sound: boolean;
  user: string | null;
  user_id: number | null;
  team: string | null;
  team_id: number | null;
  date: string; // ISO 8601
}

export interface SSENotificationDebugState {
  status: "idle" | "connecting" | "open" | "hidden" | "error" | "closed";
  errorCount: number;
  reconnectDelayMs: number;
  eventCount: number;
  notificationCount: number;
  parseErrorCount: number;
  lastEventType: string | null;
  lastEventAt: string | null;
  lastPayloadPreview: string | null;
  lastError: string | null;
}

export const initialSSENotificationDebugState: SSENotificationDebugState = {
  status: "idle",
  errorCount: 0,
  reconnectDelayMs: 0,
  eventCount: 0,
  notificationCount: 0,
  parseErrorCount: 0,
  lastEventType: null,
  lastEventAt: null,
  lastPayloadPreview: null,
  lastError: null,
};

let syntheticIdCounter = 1;

function normalizeNotification(raw: unknown): CTFdNotification | null {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;
  const wrapped =
    (obj.notification as Record<string, unknown> | undefined) ??
    (obj.data as Record<string, unknown> | undefined) ??
    obj;

  const id = wrapped.id;
  const title = wrapped.title;
  const content = wrapped.content;
  const html = wrapped.html;
  const type = wrapped.type;
  const date = wrapped.date;

  const numericId =
    typeof id === "number" && Number.isFinite(id)
      ? id
      : typeof id === "string" && /^[0-9]+$/.test(id)
        ? Number(id)
        : typeof id === "string" && id.length > 0
          ? Array.from(id).reduce(
              (acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0,
              7,
            )
          : Date.now() + syntheticIdCounter++;

  return {
    id: numericId,
    title: typeof title === "string" ? title : "Notification",
    content: typeof content === "string" ? content : "",
    html: typeof html === "string" ? html : "",
    type: typeof type === "string" && type.length > 0 ? type : "toast",
    sound: Boolean(wrapped.sound),
    user: typeof wrapped.user === "string" ? wrapped.user : null,
    user_id:
      typeof wrapped.user_id === "number"
        ? wrapped.user_id
        : wrapped.user_id == null
          ? null
          : Number(wrapped.user_id),
    team: typeof wrapped.team === "string" ? wrapped.team : null,
    team_id:
      typeof wrapped.team_id === "number"
        ? wrapped.team_id
        : wrapped.team_id == null
          ? null
          : Number(wrapped.team_id),
    date:
      typeof date === "string" && date.length > 0
        ? date
        : new Date().toISOString(),
  };
}

function parseEventNotification(event: MessageEvent): CTFdNotification | null {
  const raw = event.data;
  if (typeof raw === "string") {
    if (raw.trim().length === 0) return null;

    try {
      const parsed = JSON.parse(raw) as unknown;
      return normalizeNotification(parsed);
    } catch {
      return null;
    }
  }

  if (typeof raw === "object" && raw !== null) {
    return normalizeNotification(raw);
  }

  return null;
}

/**
 * Always connects to /events unconditionally.
 * CTFd handles auth server-side; if the user is not logged in the stream
 * simply won't emit notification events (or will close), and we back off.
 */
export function useSSENotifications(
  onNotification: (n: CTFdNotification) => void,
  onDebug?: (state: SSENotificationDebugState) => void,
) {
  const esRef = useRef<EventSource | null>(null);
  const cbRef = useRef(onNotification);
  cbRef.current = onNotification;
  const debugCbRef = useRef(onDebug);
  debugCbRef.current = onDebug;
  // track consecutive errors to implement exponential back-off
  const errorCountRef = useRef(0);
  const debugEnabledRef = useRef(isNotificationDebugEnabled());
  const debugRef = useRef<SSENotificationDebugState>(
    initialSSENotificationDebugState,
  );

  const updateDebug = useCallback(
    (
      patch:
        | Partial<SSENotificationDebugState>
        | ((prev: SSENotificationDebugState) => SSENotificationDebugState),
    ) => {
      const prev = debugRef.current;
      const next =
        typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      debugRef.current = next;
      debugCbRef.current?.(next);
    },
    [],
  );

  const connect = useCallback(() => {
    updateDebug({ status: "connecting", reconnectDelayMs: 0, lastError: null });
    if (debugEnabledRef.current) {
      console.info("[notifications:sse] connecting to /events");
    }

    esRef.current?.close();
    const es = new EventSource("/events", { withCredentials: true });
    esRef.current = es;

    es.onopen = () => {
      errorCountRef.current = 0;
      updateDebug({
        status: "open",
        errorCount: 0,
        reconnectDelayMs: 0,
        lastError: null,
      });
      if (debugEnabledRef.current) {
        console.info("[notifications:sse] stream opened");
      }
    };

    const onAnyNotificationEvent = (e: MessageEvent) => {
      updateDebug((prev) => ({
        ...prev,
        eventCount: prev.eventCount + 1,
        lastEventType: e.type,
        lastEventAt: new Date().toISOString(),
        lastPayloadPreview:
          typeof e.data === "string"
            ? e.data.slice(0, 240)
            : JSON.stringify(e.data).slice(0, 240),
      }));

      const data = parseEventNotification(e);
      if (!data) {
        updateDebug((prev) => ({
          ...prev,
          parseErrorCount: prev.parseErrorCount + 1,
        }));
        if (debugEnabledRef.current) {
          console.warn("[notifications:sse] failed to parse event payload", {
            eventType: e.type,
            raw: e.data,
          });
        }
        return;
      }

      errorCountRef.current = 0;
      updateDebug((prev) => ({
        ...prev,
        status: "open",
        errorCount: 0,
        reconnectDelayMs: 0,
        notificationCount: prev.notificationCount + 1,
      }));
      if (debugEnabledRef.current) {
        console.info("[notifications:sse] notification received", {
          id: data.id,
          type: data.type,
          title: data.title,
        });
      }
      cbRef.current(data);
    };

    // CTFd variants seen in the wild: "notification" or "notifications";
    // keep "message" fallback for default SSE event payloads.
    es.addEventListener("notification", onAnyNotificationEvent);
    es.addEventListener("notifications", onAnyNotificationEvent);
    es.onmessage = onAnyNotificationEvent;

    // "ping" keep-alives reset the error counter too
    es.addEventListener("ping", () => {
      errorCountRef.current = 0;
      updateDebug((prev) => ({
        ...prev,
        eventCount: prev.eventCount + 1,
        lastEventType: "ping",
        lastEventAt: new Date().toISOString(),
      }));
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
      errorCountRef.current += 1;
      // exponential back-off: 5s, 10s, 20s … capped at 60s
      const delay = Math.min(5000 * 2 ** (errorCountRef.current - 1), 60_000);
      updateDebug({
        status: "error",
        errorCount: errorCountRef.current,
        reconnectDelayMs: delay,
        lastError: "EventSource error",
        lastEventAt: new Date().toISOString(),
      });
      if (debugEnabledRef.current) {
        console.error("[notifications:sse] stream error, reconnect scheduled", {
          errorCount: errorCountRef.current,
          reconnectDelayMs: delay,
        });
      }
      setTimeout(() => {
        if (document.visibilityState !== "hidden") {
          connect();
        }
      }, delay);
    };
  }, [updateDebug]); // stable

  useEffect(() => {
    connect();

    // pause when tab hidden, resume when visible
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        esRef.current?.close();
        esRef.current = null;
        updateDebug({ status: "hidden" });
        if (debugEnabledRef.current) {
          console.info("[notifications:sse] paused (tab hidden)");
        }
      } else if (!esRef.current) {
        errorCountRef.current = 0;
        updateDebug({ status: "connecting", errorCount: 0, reconnectDelayMs: 0 });
        if (debugEnabledRef.current) {
          console.info("[notifications:sse] resuming (tab visible)");
        }
        connect();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      esRef.current?.close();
      esRef.current = null;
      updateDebug({ status: "closed" });
      if (debugEnabledRef.current) {
        console.info("[notifications:sse] closed");
      }
    };
  }, [connect, updateDebug]);
}
