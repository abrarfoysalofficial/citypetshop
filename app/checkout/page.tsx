"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useVouchers } from "@/context/VouchersContext";
import { calculateCheckout, type ShippingCity } from "@/lib/checkout";
import {
  checkoutSchema,
  type CheckoutFormData,
} from "@/lib/validations/checkout";
import {
  ALL_DISTRICTS,
  getZoneFromDistrict,
} from "@/lib/checkout-districts";
import Image from "next/image";
import SafeImage from "@/components/media/SafeImage";
import { captureEvent } from "@/lib/analytics";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { getVoucherByCode } = useVouchers();
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState("");
  const [placed, setPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [deliverySettings, setDeliverySettings] = useState<{ deliveryInsideDhaka?: number; deliveryOutsideDhaka?: number; termsUrl?: string; privacyUrl?: string }>({});
  const [paymentGateways, setPaymentGateways] = useState<Array<{ gateway: string; display_name_en: string; display_name_bn: string | null }>>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      district: "dhaka",
      city: "inside_dhaka",
      notes: "",
      paymentMethod: "cod",
      acceptTerms: false,
    },
  });

  const district = watch("district");
  const city = watch("city");
  const zone: ShippingCity =
    district ? getZoneFromDistrict(district) : city;

  useEffect(() => {
    fetch("/api/checkout/settings").then((r) => r.json()).then(setDeliverySettings).catch(() => {});
    fetch("/api/payment-gateways").then((r) => r.json()).then((data) => {
      setPaymentGateways(data || []);
      // Set first payment method as default
      if (data && data.length > 0) {
        setValue("paymentMethod", data[0].gateway);
      }
    }).catch(() => {});
  }, [setValue]);

  const subtotal = items.reduce((s: number, i) => s + i.price * i.quantity, 0);
  const { deliveryCharge, discountAmount, total } = calculateCheckout(
    subtotal,
    zone,
    voucherDiscount,
    deliverySettings.deliveryInsideDhaka != null
      ? { inside: deliverySettings.deliveryInsideDhaka, outside: deliverySettings.deliveryOutsideDhaka ?? 130 }
      : undefined
  );

  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError("");
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      setVoucherDiscount(0);
      return;
    }
    const localVoucher = getVoucherByCode(code);
    if (localVoucher && localVoucher.active) {
      const minOk = !localVoucher.minSpend || subtotal >= localVoucher.minSpend;
      if (!minOk) {
        setVoucherError(`Minimum purchase ৳${localVoucher.minSpend}`);
        return;
      }
      const discount = localVoucher.discountType === "percent"
        ? Math.round(subtotal * (localVoucher.value / 100))
        : Math.min(localVoucher.value, subtotal);
      setVoucherDiscount(discount);
      return;
    }
    try {
      const res = await fetch("/api/checkout/voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.valid) {
        setVoucherDiscount(data.discount);
      } else {
        setVoucherDiscount(0);
        setVoucherError((data as { error?: string }).error || "Invalid voucher code");
      }
    } catch {
      setVoucherDiscount(0);
      setVoucherError("Could not validate voucher");
    }
  };

  const onDistrictChange = (value: string) => {
    setValue("district", value);
    const z = getZoneFromDistrict(value);
    setValue("city", z);
  };

  useEffect(() => {
    if (items.length > 0) {
      captureEvent({ event_name: "InitiateCheckout", payload_summary: { value: total, content_ids: items.map((i) => i.id) } });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!data.acceptTerms) return;
    setPlacing(true);
    const orderTotal = total;
    const orderPayload = {
      customerName: data.name?.trim() ?? "",
      email: data.email?.trim() || "",
      phone: data.phone?.trim() || undefined,
      subtotal,
      deliveryCharge,
      discountAmount: voucherDiscount,
      total: orderTotal,
      items: items.map((i) => ({
        productId: i.id,
        name: i.name,
        qty: i.quantity,
        price: i.price,
      })),
      shippingAddress: [data.address ?? "", data.district ?? "", data.city ?? ""].filter(Boolean).join(", "),
      shippingCity: zone,
      paymentMethod: data.paymentMethod ?? "cod",
      voucherCode: voucherDiscount > 0 ? voucherCode.trim() || undefined : undefined,
    };
    try {
      const res = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const json = await res.json().catch(() => ({}));
      const orderId = (json as { orderId?: string }).orderId;
      if (res.ok && orderId) {
        captureEvent({ event_name: "Purchase", payload_summary: { transaction_id: orderId, value: orderTotal, content_ids: items.map((i) => i.id) } });
        setPlaced(true);
        clearCart();
        router.push(`/order-complete?orderId=${encodeURIComponent(orderId)}`);
        router.refresh();
      } else if (res.status === 501 || res.status === 503) {
        const fallbackId = `ORD-${Date.now()}`;
        captureEvent({ event_name: "Purchase", payload_summary: { transaction_id: fallbackId, value: orderTotal, content_ids: items.map((i) => i.id) } });
        setPlaced(true);
        clearCart();
        router.push(`/order-complete?orderId=${encodeURIComponent(fallbackId)}`);
        router.refresh();
      } else {
        setPlacing(false);
        return;
      }
    } catch {
      setPlacing(false);
      return;
    }
    setPlacing(false);
  };

  if (items.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Your cart is empty
        </h1>
        <Link
          href="/shop"
          className="mt-4 inline-block font-medium text-primary hover:underline"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mx-auto max-w-md px-4 py-16 text-center"
        >
          <h1 className="text-2xl font-bold text-emerald-600">
            Order placed successfully
          </h1>
          <p className="mt-2 text-slate-600">
            Redirecting to order confirmation…
          </p>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 grid gap-8 lg:grid-cols-5"
      >
        <div className="space-y-6 lg:col-span-3">
          {/* Coupon – before payment */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">
              Have a coupon?
            </h2>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => {
                  setVoucherCode(e.target.value);
                  setVoucherError("");
                }}
                placeholder="Enter voucher code"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                className="rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-300"
              >
                Apply
              </button>
            </div>
            {voucherError && (
              <p className="mt-1 text-sm text-red-600">{voucherError}</p>
            )}
            {voucherDiscount > 0 && (
              <p className="mt-2 text-sm font-medium text-emerald-600">
                ৳{voucherDiscount} discount applied
              </p>
            )}
          </section>

          {/* Payment method selection cards */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              Payment method
            </h2>
            <div className={`grid gap-3 ${paymentGateways.length > 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'}`}>
              {paymentGateways.map((gateway) => (
                <label key={gateway.gateway} className="cursor-pointer">
                  <input
                    type="radio"
                    value={gateway.gateway}
                    {...register("paymentMethod")}
                    className="peer sr-only"
                  />
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`rounded-xl border-2 p-4 transition-colors peer-checked:border-primary peer-checked:bg-primary/5 ${
                      watch("paymentMethod") === gateway.gateway ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{gateway.display_name_en}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {gateway.gateway === "cod" && "Pay when you receive"}
                      {gateway.gateway === "bkash" && "Mobile payment via bKash"}
                      {gateway.gateway === "nagad" && "Mobile payment via Nagad"}
                      {gateway.gateway === "sslcommerz" && "Card, bKash, Nagad & more"}
                    </p>
                  </motion.div>
                </label>
              ))}
            </div>
            {watch("paymentMethod") === "online" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500"
              >
                <span>Secure online payment:</span>
                <Image src="/ui/sslcommerz.png" alt="SSLCommerz secure payment" width={80} height={20} className="h-5 w-auto object-contain" />
              </motion.p>
            )}
          </section>

          {/* Customer form */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">
              Shipping details
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("name")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.name && (
                <p className="mt-0.5 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register("phone")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.phone && (
                <p className="mt-0.5 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Optional"
              />
              {errors.email && (
                <p className="mt-0.5 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("address")}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Street, building, apartment"
              />
              {errors.address && (
                <p className="mt-0.5 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                District <span className="text-red-500">*</span>
              </label>
              <select
                {...register("district")}
                onChange={(e) => onDistrictChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {ALL_DISTRICTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label} (৳
                    {d.zone === "inside_dhaka"
                      ? (deliverySettings.deliveryInsideDhaka ?? 70)
                      : (deliverySettings.deliveryOutsideDhaka ?? 130)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                {...register("notes")}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Optional delivery instructions"
              />
            </div>

            {/* Terms checkbox */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  {...register("acceptTerms")}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-700">
                  I agree to the{" "}
                  <Link
                    href={deliverySettings.termsUrl ?? "/terms"}
                    className="font-medium text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={deliverySettings.privacyUrl ?? "/privacy"}
                    className="font-medium text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </Link>{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
              )}
            </div>
          </section>
        </div>

        {/* Order summary – right column */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Order summary</h2>

            <ul className="mt-4 max-h-48 space-y-3 overflow-y-auto border-b border-slate-200 pb-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      fallbackSrc="/products/placeholder.webp"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.quantity} × ৳{item.price.toLocaleString("en-BD")}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    ৳{(item.price * item.quantity).toLocaleString("en-BD")}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">
                  ৳{subtotal.toLocaleString("en-BD")}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>-৳{discountAmount.toLocaleString("en-BD")}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Delivery</span>
                <span className="text-slate-900">
                  {zone === "inside_dhaka"
                    ? `Inside Dhaka ৳${deliverySettings.deliveryInsideDhaka ?? 70}`
                    : `Outside Dhaka ৳${deliverySettings.deliveryOutsideDhaka ?? 130}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>৳{total.toLocaleString("en-BD")}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={placing}
              className="mt-6 w-full rounded-lg bg-primary py-3 font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {placing ? "Placing order…" : "Place Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
