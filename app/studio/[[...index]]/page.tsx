"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity/sanity.config";

/**
 * Sanity Studio embedded at /studio.
 * Configure SANITY_STUDIO_* or NEXT_PUBLIC_SANITY_* in .env.local.
 */
export default function StudioPage() {
  return <NextStudio config={config} />;
}
