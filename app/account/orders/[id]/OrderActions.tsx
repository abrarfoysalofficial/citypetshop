"use client";

import { useState } from "react";

export function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const canCancel = ["pending", "processing"].includes(status);
  const canReturn = ["delivered", "shipped"].includes(status);

  const handleCancel = () => {
    setMsg(`Cancel request for ${orderId} submitted (mock).`);
  };
  const handleReturn = () => {
    setMsg(`Return request for ${orderId} submitted (mock).`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {canCancel && (
        <button type="button" onClick={handleCancel} className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">
          Cancel order (mock)
        </button>
      )}
      {canReturn && (
        <button type="button" onClick={handleReturn} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Request return (mock)
        </button>
      )}
      {msg && <p className="w-full text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
