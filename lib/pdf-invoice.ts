/**
 * Server-side PDF invoice generation using pdf-lib.
 * Call from Server Action or API route; pass order + items.
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface InvoiceOrder {
  id: string;
  created_at: string;
  status: string;
  subtotal: number;
  delivery_charge: number;
  discount_amount: number;
  total: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  voucher_code?: string | null;
}

export interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const SITE_NAME = "City Plus Pet Shop";

export async function generateInvoicePDF(
  order: InvoiceOrder,
  items: InvoiceItem[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([400, 600]);
  const { width, height } = page.getSize();
  let y = height - 50;

  const draw = (text: string, x: number, size = 10, bold = false) => {
    const f = bold ? fontBold : font;
    page.drawText(text, { x, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
    y -= size + 4;
  };

  draw(SITE_NAME, 50, 18, true);
  draw("Invoice", 50, 14);
  y -= 10;

  draw(`Order #${order.id.slice(0, 8)}`, 50, 10);
  draw(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 50, 10);
  draw(`Status: ${order.status}`, 50, 10);
  y -= 10;

  draw("Ship to:", 50, 10, true);
  draw(order.shipping_name, 50, 10);
  draw(order.shipping_phone, 50, 10);
  draw(order.shipping_address, 50, 10);
  draw(order.shipping_city, 50, 10);
  y -= 16;

  draw("Items", 50, 10, true);
  items.forEach((item) => {
    draw(`${item.product_name} x ${item.quantity} — ৳${item.total_price.toLocaleString("en-BD")}`, 50, 9);
  });
  y -= 10;

  draw(`Subtotal: ৳${order.subtotal.toLocaleString("en-BD")}`, 250, 10);
  draw(`Delivery: ৳${order.delivery_charge.toLocaleString("en-BD")}`, 250, 10);
  if (order.discount_amount > 0) {
    draw(`Discount: -৳${order.discount_amount.toLocaleString("en-BD")}`, 250, 10);
  }
  draw(`Total: ৳${order.total.toLocaleString("en-BD")}`, 250, 12, true);

  const pdfBytes = await doc.save();
  return pdfBytes;
}
