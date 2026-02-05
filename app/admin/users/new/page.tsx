"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Key, Eye, EyeOff } from "lucide-react";

export default function AdminAddUserPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [role, setRole] = useState("customer");
  const [submitted, setSubmitted] = useState(false);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let p = "";
    for (let i = 0; i < 16; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setPassword(p);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Add User</h1>
        <Link href="/admin/customers" className="text-sm font-medium text-primary hover:underline">← Back to Customers</Link>
      </div>
      <p className="text-slate-600">Create a brand new user and add them to this site.</p>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Username (required)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email (required)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">First name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Last name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <div className="mt-1 flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
              />
              <button type="button" onClick={generatePassword} className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Key className="h-4 w-4" /> Generate
              </button>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Between 6 and 150 characters. Use Generate for a strong password.</p>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)} className="rounded border-slate-300" />
            <span className="text-sm text-slate-700">Send the new user an email about their account.</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="customer">Customer</option>
              <option value="shop_manager">Shop manager</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>
        </div>
        <button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <UserPlus className="h-4 w-4" /> {submitted ? "User added" : "Add User"}
        </button>
      </form>
    </div>
  );
}
