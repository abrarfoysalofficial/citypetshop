"use client";

/**
 * Loaded only on the client so the build never runs @sanity/ui/styled-components in Node.
 */
import config from "@/sanity/sanity.config";
import { NextStudio } from "next-sanity/studio";

export default function StudioClient() {
  return <NextStudio config={config} />;
}
