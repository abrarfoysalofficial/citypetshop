import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16"><div className="h-8 w-48 animate-pulse rounded bg-slate-200" /><div className="mt-4 h-4 w-64 animate-pulse rounded bg-slate-100" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
