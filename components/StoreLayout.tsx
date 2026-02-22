"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Header from "@/components/home/Header";
import HomeFooter from "@/components/home/HomeFooter";
import { LiveVisitorHeartbeat } from "@/components/analytics/LiveVisitorHeartbeat";

const CartSlideOver = dynamic(() => import("@/components/CartSlideOver"), { ssr: false });
const FloatingUI = dynamic(() => import("@/components/FloatingUI"), { ssr: false });
const MobileBottomNav = dynamic(() => import("@/components/home/MobileBottomNav"), { ssr: false });

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isStudio = pathname?.startsWith("/studio");

  if (isAdmin || isStudio) {
    return <>{children}</>;
  }

  return (
    <>
      <LiveVisitorHeartbeat />
      <Header />
      {/* pb-24: mobile bottom nav (56px) + safe-area (~34px); desktop no padding */}
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <HomeFooter />
      <CartSlideOver />
      <FloatingUI />
      <MobileBottomNav />
    </>
  );
}
