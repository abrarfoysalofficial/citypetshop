"use client";

import { useEffect, useRef } from "react";

const HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * Phase 11: Sends periodic heartbeat to /api/analytics/heartbeat
 * for live visitor tracking. Only runs when Prisma is configured (API handles that).
 */
export function LiveVisitorHeartbeat() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sessionId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("__live_session") ??
          (() => {
            const id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
            sessionStorage.setItem("__live_session", id);
            return id;
          })()
        : null;

    if (!sessionId) return;

    const sendHeartbeat = () => {
      fetch("/api/analytics/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          pageUrl: typeof window !== "undefined" ? window.location.pathname + window.location.search : undefined,
          referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
        }),
      }).catch(() => {});
    };

    sendHeartbeat();
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return null;
}
