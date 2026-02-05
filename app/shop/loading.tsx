export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex gap-4">
        <div className="h-10 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-10 flex-1 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
