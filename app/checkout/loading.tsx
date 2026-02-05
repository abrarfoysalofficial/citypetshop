export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>
        <div className="lg:col-span-2">
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
