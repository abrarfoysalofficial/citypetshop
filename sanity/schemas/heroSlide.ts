import { defineType, defineField } from "sanity";

export const heroSlideSchema = defineType({
  name: "heroSlide",
  title: "Hero Slide",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subheadline",
      title: "Subheadline",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
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
      initialValue: "Shop Now",
    }),
    defineField({
      name: "discountText",
      title: "Discount Badge Text",
      type: "string",
      description: "e.g. SAVE UP 30%",
    }),
  ],
});
