import { NextResponse } from "next/server";
import { requireAdminAuthAndPermission } from "@lib/admin-auth";
import { getDefaultTenantId } from "@lib/tenant";
import { testPathaoConnection } from "@lib/courier/pathao-client";
import { getCourierSandbox } from "@lib/courier/provider-config";

export const dynamic = "force-dynamic";

/** POST: Test Pathao connection. Real API call (stores.list). Returns pass/fail + message, never secrets. */
export async function POST() {
  const auth = await requireAdminAuthAndPermission("settings.edit");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const tenantId = getDefaultTenantId();
  const sandbox = await getCourierSandbox(tenantId);

  const result = await testPathaoConnection(tenantId, sandbox);

  return NextResponse.json({
    ok: result.ok,
    message: result.message,
  });
}
