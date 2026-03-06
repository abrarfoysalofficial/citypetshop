import { NextResponse } from "next/server";
import { prisma } from "@lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 60;

/** Public API: About page content (founder + team). Cached 60s. */
export async function GET() {
  try {
    const [founder, team] = await Promise.all([
      prisma.aboutPageProfile.findUnique({
        where: { id: "founder", isActive: true },
      }),
      prisma.teamMember.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);
    return NextResponse.json({
      founder: founder ?? null,
      team: team ?? [],
    });
  } catch (err) {
    console.error("[api/about]:", err);
    return NextResponse.json({ founder: null, team: [] });
  }
}
