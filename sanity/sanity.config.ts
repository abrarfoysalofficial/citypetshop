import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "build-time-placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() ?? "production";

export default defineConfig({
  name: "city-plus-pet-shop",
  title: "City Plus Pet Shop CMS",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool(),
    visionTool({ defaultApiVersion: "2024-01-01" }),
  ],
  schema: {
    types: schemaTypes,
  },
});
