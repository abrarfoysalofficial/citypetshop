export const dynamic = "force-dynamic";
import { getAdminCustomers } from "@/src/data/provider";
import { AdminCustomersClient } from "./AdminCustomersClient";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();
  return <AdminCustomersClient customers={customers} />;
}
