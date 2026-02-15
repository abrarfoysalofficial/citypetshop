import { redirect } from "next/navigation";

export default function AdminLogoutPage() {
  redirect("/api/admin/logout?next=/admin/login");
}
