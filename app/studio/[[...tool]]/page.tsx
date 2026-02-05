/**
 * Sanity Studio at /studio. Loaded client-only to avoid ESM/react-dom issues during build.
 */
import nextDynamic from "next/dynamic";
import config from "../../../sanity/sanity.config";

const NextStudio = nextDynamic(
  () => import("next-sanity/studio").then((mod) => mod.NextStudio),
  { ssr: false }
);

export const dynamic = "force-dynamic";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
