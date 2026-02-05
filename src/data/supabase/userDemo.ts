import type { DemoUserProfile, DemoOrder, DemoInvoice, DemoReturn } from "../types";
import { DATA_SOURCE } from "@/src/config/runtime";

function requireSupabase() {
  if (DATA_SOURCE !== "supabase") throw new Error("Supabase data source not enabled");
}

export async function getUserAccountOverview(): Promise<{
  profile: DemoUserProfile;
  recentOrders: DemoOrder[];
  orderCount: number;
}> {
  requireSupabase();
  return {
    profile: { id: "", email: "", name: "" },
    recentOrders: [],
    orderCount: 0,
  };
}

export async function getUserOrders(): Promise<DemoOrder[]> {
  requireSupabase();
  return [];
}

export async function getUserOrderById(_id: string): Promise<DemoOrder | null> {
  requireSupabase();
  return null;
}

export async function getUserInvoices(): Promise<DemoInvoice[]> {
  requireSupabase();
  return [];
}

export async function getUserReturns(): Promise<DemoReturn[]> {
  requireSupabase();
  return [];
}
