import { getAdminCustomers } from "@/src/data/provider";
import { DATA_SOURCE } from "@/src/config/runtime";
import { AdminCustomersClient } from "./AdminCustomersClient";

export default async function AdminCustomersPage() {
  const customers = DATA_SOURCE === "local" ? await getAdminCustomers() : [];
  return <AdminCustomersClient customers={customers} />;
}
