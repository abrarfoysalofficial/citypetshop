/**
 * Studio layout: full viewport for Sanity Studio.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#0f0f0f]">{children}</div>;
}
