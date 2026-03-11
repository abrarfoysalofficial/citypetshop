import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/account");
  }

  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16"><div className="h-8 w-48 animate-pulse rounded bg-slate-200" /><div className="mt-4 h-4 w-64 animate-pulse rounded bg-slate-100" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
