import type { ComboOffer } from "../types";
import { DATA_SOURCE } from "@/src/config/runtime";

export async function getComboOffers(): Promise<ComboOffer[]> {
  if (DATA_SOURCE !== "supabase") throw new Error("Supabase not enabled");
  return [];
}
