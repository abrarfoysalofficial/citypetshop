/**
 * Analytics helpers: GTM dataLayer, event typing.
 * No hardcoded IDs; read from env.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type GtmEvent =
  | { event: "ViewContent"; content_type?: string; content_ids?: string[]; content_name?: string; value?: number; currency?: string }
  | { event: "Search"; search_string?: string }
  | { event: "AddToCart"; content_ids?: string[]; content_name?: string; value?: number; currency?: string; content_type?: string }
  | { event: "InitiateCheckout"; value?: number; currency?: string; content_ids?: string[] }
  | { event: "Purchase"; transaction_id?: string; value?: number; currency?: string; content_ids?: string[]; event_id?: string }
  | { event: string; [key: string]: unknown };

/** Push to GTM dataLayer (typed). Event_id for dedup - generate client-side when needed. */
export function pushDataLayer(payload: GtmEvent): void {
  if (typeof window !== "undefined" && Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload);
  }
}

/** Send event to server for storage (analytics_events table). Dedup via event_id. */
export function captureEvent(payload: {
  event_name: string;
  event_id?: string;
  page_url?: string;
  referrer?: string;
  payload_summary?: Record<string, unknown>;
}): void {
  if (typeof window === "undefined") return;
  const eventId = payload.event_id || `ev_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  fetch("/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_name: payload.event_name,
      event_id: eventId,
      source: "browser",
      page_url: (payload.page_url ?? window.location?.href) || undefined,
      referrer: (payload.referrer ?? document.referrer) || undefined,
      payload_summary: payload.payload_summary,
    }),
  }).catch(() => {});
}
