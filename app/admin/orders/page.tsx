import { getAdminOrders } from "@/src/data/provider";
import { DATA_SOURCE } from "@/src/config/runtime";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  const orders = DATA_SOURCE === "local" ? await getAdminOrders() : [];

  return (
    <AdminOrdersClient
      orders={orders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        email: o.email,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      }))}
    />
  );
}
