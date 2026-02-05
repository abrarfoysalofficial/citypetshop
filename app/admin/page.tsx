import { getAdminDashboard } from "@/src/data/provider";
import { DATA_SOURCE } from "@/src/config/runtime";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const initialData =
    DATA_SOURCE === "local" ? await getAdminDashboard() : null;
  return <AdminDashboardClient initialData={initialData} />;
}
