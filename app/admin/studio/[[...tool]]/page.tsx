/**
 * Sanity Studio at /admin/studio. Config and NextStudio load only in the client bundle
 * so the build never runs @sanity/ui/styled-components in Node (avoids ESM/CJS named-export error).
 */
import nextDynamic from "next/dynamic";

const AdminStudioClient = nextDynamic(() => import("./StudioClient"), { ssr: false });

export const dynamic = "force-dynamic";

export default function AdminStudioPage() {
  return <AdminStudioClient />;
}
