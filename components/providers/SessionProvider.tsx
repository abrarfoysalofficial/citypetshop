"use client";

import type { ReactNode } from "react";

/**
 * Legacy compatibility wrapper.
 * Session provider ownership is now handled by ClerkProvider in app/layout.tsx.
 */
export default function SessionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
