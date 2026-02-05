"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Header from "@/components/home/Header";
import HomeFooter from "@/components/home/HomeFooter";

const CartSlideOver = dynamic(() => import("@/components/CartSlideOver"), { ssr: false });
const FloatingUI = dynamic(() => import("@/components/FloatingUI"), { ssr: false });

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isStudio = pathname?.startsWith("/studio");

  if (isAdmin || isStudio) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <HomeFooter />
      <CartSlideOver />
      <FloatingUI />
    </>
  );
}
