/**
 * SSLCommerz Order Validation API.
 * Call after receiving IPN to verify transaction before updating order.
 * @see https://developer.sslcommerz.com/doc/v4/#order-validation-api
 */
import { getSslCommerzCredentials } from "./sslcommerz";

const SANDBOX_VALIDATOR = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";
const LIVE_VALIDATOR = "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php";

export interface ValidationResult {
  valid: boolean;
  status: "VALID" | "VALIDATED" | "FAILED" | "CANCELLED" | "INVALID_TRANSACTION";
  tranId?: string;
  amount?: number;
  riskLevel?: number;
  raw?: Record<string, unknown>;
}

/**
 * Validate transaction with SSLCommerz. Call from webhook before updating order.
 * Returns validation result; caller must verify tran_id matches order and amount matches.
 */
export async function validateSslCommerzTransaction(valId: string): Promise<ValidationResult> {
  const creds = await getSslCommerzCredentials();
  if (!creds) {
    return { valid: false, status: "INVALID_TRANSACTION", raw: { error: "Credentials not configured" } };
  }

  const url = creds.environment === "live" ? LIVE_VALIDATOR : SANDBOX_VALIDATOR;
  const params = new URLSearchParams({
    val_id: valId,
    store_id: creds.store_id,
    store_passwd: creds.store_password,
    format: "json",
  });

  try {
    const res = await fetch(`${url}?${params.toString()}`, { method: "GET" });
    const data = (await res.json()) as Record<string, unknown>;
    const status = String(data.status ?? "").toUpperCase();

    if (status === "VALID" || status === "VALIDATED") {
      const amount = data.amount != null ? parseFloat(String(data.amount)) : undefined;
      const riskLevel = typeof data.risk_level === "number" ? data.risk_level : undefined;
      return {
        valid: true,
        status: status as "VALID" | "VALIDATED",
        tranId: data.tran_id as string | undefined,
        amount,
        riskLevel,
        raw: data,
      };
    }

    return {
      valid: false,
      status: (status || "INVALID_TRANSACTION") as ValidationResult["status"],
      tranId: data.tran_id as string | undefined,
      amount: data.amount != null ? parseFloat(String(data.amount)) : undefined,
      raw: data,
    };
  } catch (err) {
    console.error("[sslcommerz-validate]:", err);
    return { valid: false, status: "INVALID_TRANSACTION", raw: { error: String(err) } };
  }
}
