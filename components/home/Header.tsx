"use client";

import SlidingSalesBar from "./SlidingSalesBar";
import HeaderTopBar from "./HeaderTopBar";
import MainNavbar from "./MainNavbar";
import SearchStrip from "./SearchStrip";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white">
      <SlidingSalesBar />
      <HeaderTopBar />
      <MainNavbar />
      <SearchStrip />
    </header>
  );
}
