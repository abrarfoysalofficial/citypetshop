/**
 * Bangladesh phone number validation and formatting.
 * Valid formats: +8801XXXXXXXXX, 8801XXXXXXXXX, 01XXXXXXXXX (10 digits after 01)
 */

const BD_PHONE_REGEX = /^(\+?880|0)?1[3-9]\d{8}$/;

/** Normalize to E.164: +8801XXXXXXXXX */
export function normalizeBdPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length === 13) return `+${digits}`;
  if (digits.startsWith("01") && digits.length === 11) return `+88${digits}`;
  if (digits.startsWith("1") && digits.length === 10) return `+880${digits}`;
  return input.startsWith("+") ? input : `+${input}`;
}

/** Validate Bangladesh mobile number (01X-XXXX-XXXX) */
export function isValidBdPhone(input: string): boolean {
  const normalized = input.replace(/\s/g, "");
  return BD_PHONE_REGEX.test(normalized);
}
