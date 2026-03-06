import { redirect } from "next/navigation";

/** Canonical payment failed page is /payment/failed. Redirect legacy /payment-failed. */
export default function PaymentFailedRedirect() {
  redirect("/payment/failed");
}
