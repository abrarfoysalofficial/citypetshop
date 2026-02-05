"use client";

import HeaderTopBar from "./HeaderTopBar";
import MainNavbar from "./MainNavbar";
import SearchStrip from "./SearchStrip";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white">
      <HeaderTopBar />
      <MainNavbar />
      <SearchStrip />
    </header>
  );
}
