// Live preview API. With next-sanity@9 (Next 14), we use a stub so the app builds.
// For real-time live updates, upgrade to Next 15+ and next-sanity@11+ and use defineLive from "next-sanity/live".
import { client } from "./client";

async function sanityFetch<T>(options: {
  query: string;
  params?: Record<string, unknown>;
}): Promise<T> {
  return client.fetch<T>(options.query, options.params ?? {});
}

function SanityLive() {
  return null;
}

export { sanityFetch, SanityLive };
