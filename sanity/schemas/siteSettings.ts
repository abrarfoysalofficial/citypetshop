import { defineType, defineField, defineArrayMember } from "sanity";
import { heroSlideSchema } from "./heroSlide";

export const siteSettingsSchema = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "brand", title: "Brand" },
    { name: "seo", title: "SEO" },
    { name: "contact", title: "Contact" },
    { name: "home", title: "Homepage" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Site Title",
      type: "string",
      group: "brand",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "brand",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "brand",
    }),
    defineField({
      name: "logoDark",
      title: "Logo (Dark)",
      type: "image",
      group: "brand",
    }),
    defineField({
      name: "defaultMetaTitle",
      title: "Default Meta Title",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "defaultMetaDescription",
      title: "Default Meta Description",
      type: "text",
      group: "seo",
    }),
    defineField({
      name: "ogImage",
      title: "Default OG Image",
      type: "image",
      group: "seo",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "text",
      group: "contact",
    }),
    defineField({
      name: "whatsapp",
      title: "WhatsApp Number",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "heroSlides",
      title: "Hero Slider",
      type: "array",
      group: "home",
      of: [defineArrayMember(heroSlideSchema)],
    }),
    defineField({
      name: "bannerImages",
      title: "Banner Images",
      type: "array",
      group: "home",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            { name: "image", type: "image", title: "Image" },
            { name: "title", type: "string", title: "Title" },
            { name: "link", type: "string", title: "Link" },
            { name: "cta", type: "string", title: "Button Text" },
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
