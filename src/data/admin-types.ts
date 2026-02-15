/** Shared types for admin data layer. No Supabase imports. */

export type AdminAnalyticsResult = {
  events: unknown[];
  counts: Record<string, number>;
  lastReceivedByEvent: Record<string, string>;
  diagnostics: { pixelConfigured: boolean; capiConfigured: boolean; warnings: string[] };
};

export type AdminDashboardStats = {
  stats: { totalRevenue: number; totalOrders: number; totalProducts: number; totalCustomers: number; revenueChange: number; ordersChange: number };
  salesData: { name: string; revenue: number; orders: number }[];
  categoryData: { name: string; value: number; count: number }[];
  recentOrders: { id: string; customer: string; total: number; status: string; date: string }[];
};
