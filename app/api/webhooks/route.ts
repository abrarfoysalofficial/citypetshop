import { NextResponse } from "next/server";

/**
 * Placeholder for payment/courier webhooks. Secured; validate signature in production.
 */
export async function POST(request: Request) {
  return NextResponse.json({ received: true }, { status: 200 });
}
