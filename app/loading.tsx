/**
 * Global loading UI - skeleton for initial page load.
 */
export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-3 py-8 md:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-48 rounded bg-slate-200" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 md:p-4">
                <div className="h-[140px] rounded-lg bg-slate-200 md:aspect-[4/3] md:h-auto" />
                <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
                <div className="mt-3 h-10 rounded-lg bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
