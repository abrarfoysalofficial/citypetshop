import { defineType, defineField } from "sanity";

export const comboOfferSchema = defineType({
  name: "comboOffer",
  title: "Combo Offer",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price (BDT)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "comparePrice",
      title: "Compare at Price (BDT)",
      type: "number",
    }),
    defineField({
      name: "products",
      title: "Products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "string",
      description: "e.g. /shop or /category/dog-food",
    }),
    defineField({
      name: "cta",
      title: "Button Text",
      type: "string",
      initialValue: "View Deal",
    }),
  ],
  preview: {
    select: { title: "title", media: "image", price: "price" },
    prepare({ title, media, price }) {
      return { title: title ?? "Untitled", media, subtitle: price != null ? `৳${price}` : undefined };
    },
  },
});
