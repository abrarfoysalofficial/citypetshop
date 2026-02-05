import type { DemoDashboard, DemoOrder, DemoCustomer, DemoVoucher, DemoAuditLog } from "../types";
import { DATA_SOURCE } from "@/src/config/runtime";

function requireSupabase() {
  if (DATA_SOURCE !== "supabase") throw new Error("Supabase data source not enabled");
}

export async function getAdminDashboard(): Promise<DemoDashboard> {
  requireSupabase();
  return {
    summary: { sales: "৳0", profit: "৳0", orders: "0", returnRate: "0%", loss: "৳0" },
    salesData: [],
    activity: [],
  };
}

export async function getAdminOrders(): Promise<DemoOrder[]> {
  requireSupabase();
  return [];
}

export async function getAdminOrderById(_id: string): Promise<DemoOrder | null> {
  requireSupabase();
  return null;
}

export async function getAdminCustomers(): Promise<DemoCustomer[]> {
  requireSupabase();
  return [];
}

export async function getAdminVouchers(): Promise<DemoVoucher[]> {
  requireSupabase();
  return [];
}

export async function getAdminAuditLogs(): Promise<DemoAuditLog[]> {
  requireSupabase();
  return [];
}
