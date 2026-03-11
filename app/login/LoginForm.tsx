"use client";

import { useSearchParams } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { sanitizeCustomerCallbackUrl } from "@/lib/callback-url";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCustomerCallbackUrl(
    searchParams.get("callbackUrl") ?? searchParams.get("next"),
    typeof window !== "undefined" ? window.location.origin : undefined
  );

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <SignIn
        path="/login"
        routing="path"
        fallbackRedirectUrl={callbackUrl}
        forceRedirectUrl={callbackUrl}
      />
    </div>
  );
}
