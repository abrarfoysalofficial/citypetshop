"use client";

import SlidingSalesBar from "./SlidingSalesBar";
import TopBar from "@/components/layout/TopBar";
import StickyHeader from "@/components/layout/StickyHeader";
import SearchStrip from "./SearchStrip";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--header-bg)]">
      <SlidingSalesBar />
      <TopBar />
      <StickyHeader />
      <SearchStrip />
    </header>
  );
}
