/**
 * Standardized logging layer — structured JSON, no PII.
 * Supports request correlation id for tracing.
 */

export type LogLevel = "info" | "warn" | "error" | "critical";

export type LogMeta = Record<string, unknown>;

/** Strip any key that might contain PII. Never log: email, phone, name, address, password, token. */
function sanitizeMeta(meta: LogMeta): LogMeta {
  const piiKeys = [
    "email", "phone", "name", "address", "password", "token", "secret",
    "authorization", "cookie", "creditCard", "cvv", "ssn",
  ];
  const out: LogMeta = {};
  for (const [k, v] of Object.entries(meta)) {
    const lower = k.toLowerCase();
    if (piiKeys.some((p) => lower.includes(p))) continue;
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out;
}

function formatLog(level: LogLevel, scope: string, message: string, meta?: LogMeta): string {
  const entry = {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...(meta && Object.keys(meta).length > 0 ? sanitizeMeta(meta) : {}),
  };
  return JSON.stringify(entry);
}

export function logInfo(scope: string, message: string, meta?: LogMeta): void {
  console.log(formatLog("info", scope, message, meta));
}

export function logWarn(scope: string, message: string, meta?: LogMeta): void {
  console.warn(formatLog("warn", scope, message, meta));
}

export function logError(scope: string, message: string, meta?: LogMeta): void {
  console.error(formatLog("error", scope, message, meta));
}

export function logCritical(scope: string, message: string, meta?: LogMeta): void {
  console.error(formatLog("critical", scope, message, meta));
}

/** Extract request id from Request or Headers. Use for correlation in logs. */
export function getRequestId(request: Request | Headers): string | undefined {
  const headers = request instanceof Request ? request.headers : request;
  return headers.get("x-request-id") ?? undefined;
}

/** Log with request context (path, method, requestId). No secrets. */
export function logApiError(
  request: Request,
  error: unknown,
  context?: { scope?: string; status?: number }
): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const code = (error as { code?: string }).code;
  const requestId = getRequestId(request);
  const url = request.url ? new URL(request.url) : null;
  logError(context?.scope ?? "api", "request failed", {
    requestId,
    path: url?.pathname,
    method: request.method,
    errorType: err.name,
    errorCode: code ?? "unknown",
    status: context?.status,
  });
}
