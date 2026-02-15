"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      if (process.env.NODE_ENV === "development") {
        console.log("[admin/login] Attempting Supabase Auth sign-in");
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        const msg = authError.message || "";
        setError(
          msg.toLowerCase().includes("supabase not connected")
            ? "Login failed. Please try again later."
            : msg || "Invalid email or password."
        );
        setLoading(false);
        return;
      }

      if (!authData?.session?.user) {
        setError("Sign in failed. Please try again.");
        setLoading(false);
        return;
      }

      const userEmail = authData.user.email;
      if (!userEmail) {
        setError("Access denied. You are not authorized to access the admin panel.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // RLS: team_members needs policy USING (lower(auth.email()) = lower(email))
      const normalizedEmail = userEmail.toLowerCase();
      const { data: teamMember, error: teamError } = await supabase
        .from("team_members")
        .select("role, is_active")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (teamError) {
        if (process.env.NODE_ENV === "development") {
          console.log("[admin/login] team_members query error:", teamError.message);
        }
        setError("Access check failed. Please contact support.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!teamMember) {
        setError("Access denied. You are not authorized to access the admin panel.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!teamMember.is_active) {
        setError("Your account is inactive. Please contact administrator.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      const role = (teamMember.role ?? "").toLowerCase();
      if (role !== "admin" && role !== "adm") {
        setError("Access denied. You are not authorized to access the admin panel.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[admin/login] Authorized, redirecting to dashboard");
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to access the admin panel.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-slate-600 transition-colors hover:text-blue-600"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}
