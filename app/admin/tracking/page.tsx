const sampleEvents = [
  { id: "1", name: "PageView", count: 1240, date: "2025-01-30" },
  { id: "2", name: "AddToCart", count: 320, date: "2025-01-30" },
  { id: "3", name: "Purchase", count: 89, date: "2025-01-30" },
  { id: "4", name: "ViewContent", count: 560, date: "2025-01-30" },
];

const chartData = [
  { day: "Mon", events: 420 },
  { day: "Tue", events: 380 },
  { day: "Wed", events: 510 },
  { day: "Thu", events: 490 },
  { day: "Fri", events: 620 },
  { day: "Sat", events: 740 },
  { day: "Sun", events: 580 },
];

export default function AdminTrackingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tracking & Pixel</h1>
      <p className="text-slate-600">Meta Pixel, CAPI, events dashboard. Sample events and chart below.</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Sample Events</h2>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="pb-2 font-medium text-slate-900">Event</th>
                <th className="pb-2 font-medium text-slate-900">Count</th>
                <th className="pb-2 font-medium text-slate-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {sampleEvents.map((e) => (
                <tr key={e.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-900">{e.name}</td>
                  <td className="py-2 text-slate-600">{e.count}</td>
                  <td className="py-2 text-slate-600">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Events (Last 7 Days)</h2>
          <div className="flex h-48 items-end justify-between gap-2">
            {chartData.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full max-w-[40px] rounded-t bg-primary/80"
                  style={{ height: `${(d.events / 800) * 100}%`, minHeight: "8px" }}
                />
                <span className="text-xs text-slate-600">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
