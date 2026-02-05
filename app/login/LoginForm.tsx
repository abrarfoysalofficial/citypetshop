"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone-bd";

const AUTH_MODE =
  (process.env.NEXT_PUBLIC_AUTH_MODE as "demo" | "supabase") ??
  (process.env.NODE_ENV === "production" ? "supabase" : "demo");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== "undefined" ? window.location.origin : "");

type AuthProviders = { google: boolean; facebook: boolean; phone: boolean };

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<AuthProviders | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError(decodeURIComponent(err));
  }, [searchParams]);

  useEffect(() => {
    if (AUTH_MODE === "supabase") {
      fetch("/api/auth/providers")
        .then((r) => r.json())
        .then(setProviders)
        .catch(() => setProviders({ google: false, facebook: false, phone: false }));
    }
  }, []);

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, type: "user" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Invalid email or password");
        setLoading(false);
        return;
      }
      router.push((data as { redirect?: string }).redirect ?? "/account");
      router.refresh();
    } catch {
      setError("Login failed. Try again.");
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "facebook") => {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${SITE_URL || window.location.origin}/auth/callback?next=/account` },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    // Redirect happens automatically
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidBdPhone(phone)) {
      setError("Enter a valid Bangladesh phone (e.g. 01XXXXXXXXX)");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const normalized = normalizeBdPhone(phone);
    const { error: err } = await supabase.auth.signInWithOtp({ phone: normalized });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setOtpSent(true);
    setResendAt(Date.now() + 60000); // 60s throttle
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const normalized = normalizeBdPhone(phone);
    const { error: err } = await supabase.auth.verifyOtp({ phone: normalized, token: otp, type: "sms" });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/account");
    router.refresh();
  };

  const [resendSeconds, setResendSeconds] = useState(0);
  useEffect(() => {
    if (resendAt <= Date.now()) return;
    const tick = () => setResendSeconds(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendAt]);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Login</h1>
      <p className="mt-2 text-slate-600">
        Sign in to your account to view orders and manage your profile.
      </p>
      {AUTH_MODE === "demo" && process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === "true" && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Demo mode: use user@cityplus.local / User@12345
        </p>
      )}

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      {AUTH_MODE === "supabase" && providers && (
        <div className="mt-6 space-y-3">
          {providers.google && (
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          )}
          {providers.facebook && (
            <button
              type="button"
              onClick={() => handleOAuth("facebook")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </button>
          )}
          {providers.phone && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                    Phone (Bangladesh)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    Send OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-2">
                  <label htmlFor="otp" className="block text-sm font-medium text-slate-700">
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading || otp.length < 4}
                      className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={resendSeconds > 0 || loading}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                    >
                      {resendSeconds > 0 ? `Resend (${resendSeconds}s)` : "Resend"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Change number
                  </button>
                </form>
              )}
            </div>
          )}
          {(providers.google || providers.facebook || providers.phone) && (
            <p className="text-center text-xs text-slate-500">or</p>
          )}
        </div>
      )}

      {AUTH_MODE === "demo" && (
        <form onSubmit={handleDemoSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      )}

      {AUTH_MODE === "supabase" && (!providers || (!providers.google && !providers.facebook && !providers.phone)) && (
        <p className="mt-6 text-sm text-slate-600">
          Sign in with Google, Facebook, or Phone. Enable providers in Admin → Settings → Auth.
        </p>
      )}

      <Link href="/" className="mt-6 inline-block font-medium text-primary hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}
