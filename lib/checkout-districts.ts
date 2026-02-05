/**
 * District/zone options for checkout. Admin can override via site_settings.
 * Used for delivery charge logic and address display.
 */

import type { ShippingCity } from "./checkout";

export interface DistrictOption {
  value: string;
  label: string;
  zone: ShippingCity;
}

/** Inside Dhaka: Dhaka city and adjacent areas. */
export const INSIDE_DHAKA_DISTRICTS: DistrictOption[] = [
  { value: "dhaka", label: "Dhaka", zone: "inside_dhaka" },
  { value: "gazipur", label: "Gazipur", zone: "inside_dhaka" },
  { value: "narayanganj", label: "Narayanganj", zone: "inside_dhaka" },
  { value: "tangail", label: "Tangail", zone: "inside_dhaka" },
  { value: "manikganj", label: "Manikganj", zone: "inside_dhaka" },
  { value: "munshiganj", label: "Munshiganj", zone: "inside_dhaka" },
  { value: "narsingdi", label: "Narsingdi", zone: "inside_dhaka" },
  { value: "other_inside", label: "Other (Inside Dhaka)", zone: "inside_dhaka" },
];

/** Outside Dhaka: All other districts. */
export const OUTSIDE_DHAKA_DISTRICTS: DistrictOption[] = [
  { value: "chittagong", label: "Chittagong", zone: "outside_dhaka" },
  { value: "sylhet", label: "Sylhet", zone: "outside_dhaka" },
  { value: "rajshahi", label: "Rajshahi", zone: "outside_dhaka" },
  { value: "khulna", label: "Khulna", zone: "outside_dhaka" },
  { value: "barisal", label: "Barisal", zone: "outside_dhaka" },
  { value: "rangpur", label: "Rangpur", zone: "outside_dhaka" },
  { value: "mymensingh", label: "Mymensingh", zone: "outside_dhaka" },
  { value: "other_outside", label: "Other (Outside Dhaka)", zone: "outside_dhaka" },
];

export const ALL_DISTRICTS = [...INSIDE_DHAKA_DISTRICTS, ...OUTSIDE_DHAKA_DISTRICTS];

export function getZoneFromDistrict(districtValue: string): ShippingCity {
  const found = ALL_DISTRICTS.find((d) => d.value === districtValue);
  return found?.zone ?? "inside_dhaka";
}
