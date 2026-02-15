import { getAdminOrders } from "@/src/data/provider";
import AdminOrdersClient from "./AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const ordersData = await getAdminOrders();
  const orders = ordersData.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    email: o.email,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
  }));

  return <AdminOrdersClient orders={orders} />;
}
