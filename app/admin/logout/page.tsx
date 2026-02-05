import { redirect } from "next/navigation";

export default function AdminLogoutPage() {
  redirect("/api/auth/demo-logout?next=/admin/login");
}
