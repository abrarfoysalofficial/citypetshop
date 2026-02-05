/**
 * Recently viewed product IDs – persisted in localStorage (guest); max 20.
 * Sync with account when user is logged in (future).
 */

const RECENTLY_VIEWED_KEY = "cityplus_recently_viewed";
const MAX_ITEMS = 20;

export interface RecentlyViewedEntry {
  id: string;
  viewedAt: number;
}

export function getRecentlyViewed(): RecentlyViewedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentlyViewedEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(productId: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getRecentlyViewed().filter((e) => e.id !== productId);
    list.unshift({ id: productId, viewedAt: Date.now() });
    const trimmed = list.slice(0, MAX_ITEMS);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}
