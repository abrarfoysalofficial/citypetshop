"use client";

import { useState } from "react";
import { Save } from "lucide-react";

const DEFAULT_PAGES = [
  { id: "cart", label: "Cart", value: "/cart" },
  { id: "checkout", label: "Checkout", value: "/checkout" },
  { id: "account", label: "My account", value: "/account" },
  { id: "terms", label: "Terms and conditions", value: "/terms" },
];

const CHECKOUT_ENDPOINTS = [
  { key: "pay", label: "Pay", value: "order-pay" },
  { key: "orderReceived", label: "Order received", value: "order-received" },
  { key: "addPaymentMethod", label: "Add payment method", value: "add-payment-method" },
  { key: "deletePaymentMethod", label: "Delete payment method", value: "delete-payment-method" },
  { key: "setDefaultPaymentMethod", label: "Set default payment method", value: "set-default-payment-method" },
];

const ACCOUNT_ENDPOINTS = [
  { key: "orders", label: "Orders", value: "orders" },
  { key: "viewOrder", label: "View order", value: "view-order" },
  { key: "downloads", label: "Downloads", value: "downloads" },
  { key: "editAccount", label: "Edit account", value: "edit-account" },
  { key: "addresses", label: "Addresses", value: "edit-address" },
  { key: "paymentMethods", label: "Payment methods", value: "payment-methods" },
  { key: "lostPassword", label: "Lost password", value: "lost-password" },
  { key: "logout", label: "Logout", value: "customer-logout" },
];

export default function AdminCheckoutSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(true);
  const [loginDuringCheckout, setLoginDuringCheckout] = useState(false);
  const [accountDuringCheckout, setAccountDuringCheckout] = useState(false);
  const [accountOnMyAccount, setAccountOnMyAccount] = useState(true);
  const [sendPasswordLink, setSendPasswordLink] = useState(true);
  const [emailAsLogin, setEmailAsLogin] = useState(true);
  const [registrationPolicy, setRegistrationPolicy] = useState(
    "Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our [privacy_policy]."
  );
  const [checkoutPolicy, setCheckoutPolicy] = useState(
    "Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our [privacy_policy]."
  );

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Checkout Settings</h1>

      {/* Page setup */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Page setup</h2>
        <p className="mb-4 text-sm text-slate-600">
          These pages need to be set so the site knows where to send users for checkout and account.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {DEFAULT_PAGES.map((p) => (
            <div key={p.id}>
              <label className="block text-sm font-medium text-slate-700">{p.label}</label>
              <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value={p.value}>{p.label} ({p.value})</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Checkout endpoints */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Checkout endpoints</h2>
        <p className="mb-4 text-sm text-slate-600">
          Endpoints are appended to your page URLs to handle specific actions during checkout. They should be unique.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {CHECKOUT_ENDPOINTS.map((e) => (
            <div key={e.key}>
              <label className="block text-sm font-medium text-slate-700">{e.label}</label>
              <input
                type="text"
                defaultValue={e.value}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Account endpoints */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Account endpoints</h2>
        <p className="mb-4 text-sm text-slate-600">
          Endpoints for account pages. Leave blank to disable.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {ACCOUNT_ENDPOINTS.map((e) => (
            <div key={e.key}>
              <label className="block text-sm font-medium text-slate-700">{e.label}</label>
              <input
                type="text"
                defaultValue={e.value}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Accounts & Privacy */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Accounts &amp; Privacy</h2>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-800">Checkout</h3>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={guestCheckout} onChange={(e) => setGuestCheckout(e.target.checked)} className="rounded border-slate-300" />
              <span className="text-sm text-slate-700">Enable guest checkout (recommended)</span>
            </label>
            <label className="mt-2 flex items-center gap-2">
              <input type="checkbox" checked={loginDuringCheckout} onChange={(e) => setLoginDuringCheckout(e.target.checked)} className="rounded border-slate-300" />
              <span className="text-sm text-slate-700">Enable log-in during checkout</span>
            </label>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-800">Account creation</h3>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={accountDuringCheckout} onChange={(e) => setAccountDuringCheckout(e.target.checked)} className="rounded border-slate-300" />
              <span className="text-sm text-slate-700">During checkout</span>
            </label>
            <label className="mt-2 flex items-center gap-2">
              <input type="checkbox" checked={accountOnMyAccount} onChange={(e) => setAccountOnMyAccount(e.target.checked)} className="rounded border-slate-300" />
              <span className="text-sm text-slate-700">On &apos;My account&apos; page</span>
            </label>
            <label className="mt-2 flex items-center gap-2">
              <input type="checkbox" checked={sendPasswordLink} onChange={(e) => setSendPasswordLink(e.target.checked)} className="rounded border-slate-300" />
              <span className="text-sm text-slate-700">Send password setup link (recommended)</span>
            </label>
            <label className="mt-2 flex items-center gap-2">
              <input type="checkbox" checked={emailAsLogin} onChange={(e) => setEmailAsLogin(e.target.checked)} className="rounded border-slate-300" />
              <span className="text-sm text-slate-700">Use email address as account login (recommended)</span>
            </label>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-800">Privacy policy notices</h3>
            <p className="mb-2 text-xs text-slate-500">Shown when a privacy page is set.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Registration privacy policy</label>
                <textarea
                  value={registrationPolicy}
                  onChange={(e) => setRegistrationPolicy(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Checkout privacy policy</label>
                <textarea
                  value={checkoutPolicy}
                  onChange={(e) => setCheckoutPolicy(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
      >
        <Save className="h-4 w-4" />
        {saved ? "Saved" : "Save changes"}
      </button>
    </div>
  );
}
