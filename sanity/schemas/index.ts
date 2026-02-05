import { categorySchema } from "./category";
import { productSchema } from "./product";
import { siteSettingsSchema } from "./siteSettings";
import { comboOfferSchema } from "./comboOffer";
import { blockContent } from "./blockContent";

export const schemaTypes = [
  blockContent,
  categorySchema,
  productSchema,
  siteSettingsSchema,
  comboOfferSchema,
];
