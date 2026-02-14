import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Complete | City Plus Pet Shop",
  description: "Thank you for your order. Track your delivery and download your invoice.",
};

export default function OrderCompleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
