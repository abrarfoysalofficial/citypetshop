import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Register</h1>
      <p className="mt-2 text-slate-600">Create an account to save addresses and view order history.</p>
      <p className="mt-6 text-sm text-slate-500">
        Registration is available when Supabase Auth is connected.
      </p>
      <Link href="/" className="mt-6 inline-block font-medium text-primary hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}
