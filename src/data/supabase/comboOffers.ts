import type { ComboOffer } from "../types";
import { isSupabaseConfigured } from "@/src/config/env";

export async function getComboOffers(): Promise<ComboOffer[]> {
  if (!isSupabaseConfigured()) return [];
  return [];
}
