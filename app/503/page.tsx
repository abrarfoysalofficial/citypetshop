export default function ServiceUnavailable() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">503</h1>
      <p className="text-lg text-slate-600 mb-4">Service temporarily unavailable</p>
      <p className="text-sm text-slate-500 max-w-md text-center">
        The site is being configured. Please try again later or contact support.
      </p>
    </div>
  );
}
