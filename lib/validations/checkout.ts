import { z } from "zod";

export const checkoutShippingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required").regex(/^01[3-9]\d{8}$/, "Enter a valid 11-digit Bangladesh phone (01XXXXXXXXX)"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  area: z.string().optional(),
  district: z.string().min(1, "District is required"),
  city: z.enum(["inside_dhaka", "outside_dhaka"]),
  notes: z.string().optional(),
});

export const checkoutPaymentSchema = z.object({
  paymentMethod: z.string().min(1, "Select a payment method"),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: "You must accept the Terms & Conditions and Privacy Policy",
  }),
});

export const checkoutSchema = checkoutShippingSchema.merge(checkoutPaymentSchema);

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
