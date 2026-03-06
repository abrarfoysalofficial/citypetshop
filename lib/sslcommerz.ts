/**
 * SSLCommerz payment gateway integration.
 * Creates session and returns redirect URL for hosted payment.
 */
import { prisma } from "@lib/db";

const SANDBOX_URL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
const LIVE_URL = "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

export interface SslCommerzCredentials {
  store_id: string;
  store_password: string;
  environment?: "sandbox" | "live";
}

export interface SslCommerzInitResult {
  status: "SUCCESS" | "FAILED";
  GatewayPageURL?: string;
  failedreason?: string;
}

export async function getSslCommerzCredentials(): Promise<SslCommerzCredentials | null> {
  const gw = await prisma.paymentGateway.findUnique({
    where: { gateway: "sslcommerz", isActive: true },
  });
  if (!gw?.credentialsJson) return null;
  const c = gw.credentialsJson as Record<string, unknown>;
  const storeId = c.store_id;
  const storePass = c.store_password;
  if (!storeId || !storePass || typeof storeId !== "string" || typeof storePass !== "string") return null;
  const env = (c.environment as string) || "sandbox";
  return {
    store_id: storeId,
    store_password: storePass,
    environment: env === "live" ? "live" : "sandbox",
  };
}

export async function createSslCommerzSession(params: {
  orderId: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  productName: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl?: string;
}): Promise<SslCommerzInitResult> {
  const creds = await getSslCommerzCredentials();
  if (!creds) {
    return { status: "FAILED", failedreason: "SSLCommerz not configured" };
  }

  const form = new URLSearchParams({
    store_id: creds.store_id,
    store_passwd: creds.store_password,
    total_amount: params.totalAmount.toFixed(2),
    currency: "BDT",
    tran_id: params.orderId,
    product_category: "physical-goods",
    product_profile: "general",
    success_url: params.successUrl,
    fail_url: params.failUrl,
    cancel_url: params.cancelUrl,
    cus_name: params.customerName.slice(0, 50),
    cus_email: params.customerEmail.slice(0, 50),
    cus_add1: params.customerAddress.slice(0, 50) || "N/A",
    cus_city: params.customerCity.slice(0, 50) || "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: params.customerPhone.slice(0, 20) || "N/A",
    product_name: params.productName.slice(0, 255),
    ship_name: params.customerName.slice(0, 50),
    ship_add1: params.customerAddress.slice(0, 50) || "N/A",
    ship_city: params.customerCity.slice(0, 50) || "Dhaka",
    ship_country: "Bangladesh",
    value_a: params.orderId,
  });
  if (params.ipnUrl) form.set("ipn_url", params.ipnUrl);

  const url = creds.environment === "live" ? LIVE_URL : SANDBOX_URL;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const data = (await res.json()) as SslCommerzInitResult;
  return data;
}
