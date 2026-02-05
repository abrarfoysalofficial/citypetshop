import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
      <p className="mt-2 text-slate-600">Reset your password via email when Supabase Auth is connected.</p>
      <Link href="/login" className="mt-6 inline-block font-medium text-primary hover:underline">
        ← Back to Login
      </Link>
    </div>
  );
}
