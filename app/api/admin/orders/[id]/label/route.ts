/**
 * GET /api/admin/orders/[id]/label
 * Generate a printable shipping label PDF for an order.
 */
import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const tenantId = getDefaultTenantId();
  const order = await prisma.order.findFirst({
    where: { id: params.id, tenantId },
    select: {
      id: true,
      shippingName: true,
      shippingPhone: true,
      shippingAddress: true,
      shippingCity: true,
      total: true,
      paymentMethod: true,
      trackingCode: true,
      courierProvider: true,
      items: { select: { quantity: true, productName: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([283, 425]); // ~10cm × 15cm label
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    const black = rgb(0, 0, 0);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";
    const siteUrl = baseUrl.startsWith("http") ? new URL(baseUrl).hostname : baseUrl;

    let y = height - 20;

    // Header
    page.drawRectangle({ x: 0, y: height - 50, width, height: 50, color: rgb(0.05, 0.05, 0.05) });
    page.drawText("SHIPPING LABEL", { x: 20, y: height - 32, size: 14, font: bold, color: rgb(1, 1, 1) });
    page.drawText(siteUrl, { x: 20, y: height - 46, size: 7, font, color: rgb(0.8, 0.8, 0.8) });

    y = height - 70;

    const line = (label: string, value: string, size = 9) => {
      page.drawText(label, { x: 20, y, size: 7, font, color: rgb(0.5, 0.5, 0.5) });
      page.drawText(value.slice(0, 45), { x: 20, y: y - 11, size, font: bold, color: black });
      y -= 26;
    };

    line("ORDER ID", `#${order.id.slice(0, 8).toUpperCase()}`);
    line("RECIPIENT", order.shippingName);
    line("PHONE", order.shippingPhone);
    line("ADDRESS", order.shippingAddress);
    line("CITY", order.shippingCity);

    y -= 4;
    page.drawLine({ start: { x: 20, y }, end: { x: width - 20, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    y -= 14;

    line("TOTAL", `BDT ${Number(order.total).toLocaleString()}`, 11);
    line("PAYMENT", order.paymentMethod ?? "COD");

    if (order.trackingCode) {
      line("TRACKING", order.trackingCode);
    }
    if (order.courierProvider) {
      line("COURIER", order.courierProvider.toUpperCase());
    }

    y -= 4;
    page.drawLine({ start: { x: 20, y }, end: { x: width - 20, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    y -= 14;

    // Items summary
    page.drawText("ITEMS:", { x: 20, y, size: 7, font, color: rgb(0.5, 0.5, 0.5) });
    y -= 12;
    for (const item of order.items.slice(0, 5)) {
      page.drawText(`${item.quantity}× ${item.productName.slice(0, 38)}`, {
        x: 20, y, size: 7.5, font, color: black,
      });
      y -= 11;
    }
    if (order.items.length > 5) {
      page.drawText(`...and ${order.items.length - 5} more`, { x: 20, y, size: 7, font, color: rgb(0.5, 0.5, 0.5) });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="label-${order.id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[label] PDF generation failed:", err);
    return NextResponse.json({ error: "Label generation failed" }, { status: 500 });
  }
}
