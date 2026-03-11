"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

export default function LogoutPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    void signOut({ redirectUrl: "/" });
  }, [signOut]);
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-slate-600">Signing out…</p>
    </div>
  );
}
