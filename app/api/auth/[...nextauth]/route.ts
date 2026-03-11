import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "NextAuth route retired. Use Clerk auth endpoints." },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "NextAuth route retired. Use Clerk auth endpoints." },
    { status: 410 }
  );
}
export const dynamic = "force-dynamic";
